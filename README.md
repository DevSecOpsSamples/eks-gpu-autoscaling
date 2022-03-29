
# Summary

```bash
Kubernetes Cluster AutoScaler(CA), Karpenter 를 사용한 GPU AutoScaling guide
```

* EKS cluster & nodegroup 생성
* Kubernetes Dashboard 설치
* [Cluster AutoScaler(CA), AWS Load Balancer Controller 설치](./ClusterAutoScaler.md)

* DGCM exporter 배포
* Prometheus Stack 설치
* Prometheus custom metric 생성
* Grafana Dashboard Import
* API 배포
* GPU HPA 배포
* AutoScaling Test

# 1. EKS cluster & nodegroup

## 1.1 eksctl

```bash
eksctl create cluster -f gpu-cluster.yaml --without-nodegroup
eksctl create nodegroup -f gpu-cluster-ng.yaml
```

* [gpu-cluster.yaml](./gpu-cluster.yaml)
* [gpu-cluster-ng.yaml](./gpu-cluster-ng.yaml)

Seoul region ap-northeast-2b Zone은 GPU 인스턴스 생성 불가하므로 cluster 생성시 제외

---

## 1.2 WebConsole에서 Kubernetes objects 조회를 위한 IAM identity mapping 생성

```bash
eksctl create iamidentitymapping --cluster <CluterName> --arn arn:aws:iam::<YourAwsAccountId>:role/<YourRoleName> --group system:masters --username admin --region ap-northeast-2

2022-03-28 23:05:28 [ℹ]  eksctl version 0.70.0
2022-03-28 23:05:28 [ℹ]  using region ap-northeast-2
2022-03-28 23:05:29 [ℹ]  adding identity "arn:aws:iam::123456789:role/YourRoleName" to auth ConfigMap
```

# 2. Kubernetes Dashboard 설치 (Optional)

[자습서: Kubernetes 대시보드 배포(웹 UI)](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/dashboard-tutorial.html)

![k8s-dashboard](./screenshots/k8s-dashboard.png?raw=true)

# 3. DGCM exporter

## 3.1 exporter 설치 - 2.6.5 version

```bash
kubectl apply -f dcgm-exporter.yaml
```

```bash
kubectl apply -f dcgm-exporter-karpenter.yaml
```

* [dcgm-exporter.yaml](./dcgm-exporter.yaml)

* [dcgm-exporter-karpenter.yaml](./dcgm-exporter-karpenter.yaml)

https://github.com/NVIDIA/dcgm-exporter repository 기준

https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/dcgm-exporter.html 참고

Service Dicovery를 위한 ServiceMonitor 사용하기 위해 helm 대신 local yaml 파일로 배포

additionalScrapeConfigs 설정에 [job_name](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)을 추가해 사용 가능하나 service 단위로 configuration을 배포하기 위해  ServiceMonitor를 사용합니다.

```yaml
---
kind: Service
apiVersion: v1
metadata:
  name: "dcgm-exporter"
  labels:
    app.kubernetes.io/name: "dcgm-exporter"
    app.kubernetes.io/version: "2.6.5"
spec:
  selector:
    app.kubernetes.io/name: "dcgm-exporter"
    app.kubernetes.io/version: "2.6.5"
  ports:
  - name: "metrics"
    port: 9400
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: "dcgm-exporter"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: "dcgm-exporter"
  endpoints:
  - port: "metrics"
```

ClusterAutoscaler

```yaml
    spec:
      nodeSelector:
        accelerator: nvidia-gpu
```

Karpenter - GPU instance 에만 label 지정 불가능해 beta.kubernetes.io/instance-type 기준으로 nodeAffinity 설정

```yaml
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: beta.kubernetes.io/instance-type
                operator: In
                values:
                - p2.xlarge
                - p2.4xlarge
                - p2.8xlarge
                - g4dn.xlarge
```

## 3.2 metric value test

```bash
kubectl port-forward svc/dcgm-exporter 9400:9400
```

```bash
curl http://localhost:9400/metrics | grep dcgm
```

http://localhost:9400/metrics

# 4. Prometheus Stack 설치

* Prometheus Server
* Prometheus Operator
* Grafana

```bash
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n prometheus
```

http://localhost:9090/targets

![promethus target](./screenshots/dcgm.png?raw=true)

# 5. Prometheus custom metric 생성

## 5.1 prometheus-adapter 설치

prometheus.url 파라미터의 internal DNS 설정을 위한 서비스명 확인

```bash
kubectl get svc -lapp=kube-prometheus-stack-prometheus -n prometheus 
```

prometheus.url format: `http://<service-name>.<namespace>.svc.cluster.local`

e.g.,

* `http://kube-prometheus-prometheus.prometheus.svc.cluster.local`
* `http://kube-prometheus-prometheus.monitoring.svc.cluster.local`

```bash
helm install prometheus-adapter --set rbac.create=true,prometheus.url=http://kube-prometheus-prometheus.prometheus.svc.cluster.local,prometheus.port=9090 stable/prometheus-adapter
```

## 5.2 custom metric 확인

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq -r . | grep DCGM
```

값이 없는 경우 DCGM export pod로 들어가 `wget http://prometheus-url:port` 로 정상 접속되는지 확인합니다.

output example:

```bash
      "name": "services/DCGM_FI_DEV_FB_USED",
      "name": "jobs.batch/DCGM_FI_DEV_XID_ERRORS",
      "name": "namespaces/DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL",
      "name": "pods/DCGM_FI_DEV_SM_CLOCK",
      "name": "services/DCGM_FI_DEV_MEM_COPY_UTIL",
      "name": "pods/DCGM_FI_DEV_POWER_USAGE",
      "name": "services/DCGM_FI_DEV_ENC_UTIL",
      "name": "namespaces/DCGM_FI_DEV_VGPU_LICENSE_STATUS",
      ...
```

# 6. Grafana Dashboard import

```bash
kubectl port-forward svc/kube-prometheus-stack-grafana  8081:80 -n prometheus

kubectl get secret --namespace prometheus kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

http://localhost:8081

Dashboard import

* [NVIDIA DCGM Exporter Dashboard](https://grafana.com/grafana/dashboards/12239) 12239
* [1 Kubernetes All-in-one Cluster Monitoring KR](https://grafana.com/grafana/dashboards/13770) 13770

![grafana-dcgm](./screenshots/grafana-dcgm-01.png?raw=true)


# 7. API 배포

```bash
kubectl apply -f inf-api.yaml
```

[inf-api.yaml](./inf-api.yaml)

# 8. GPU HPA 배포

```bash
kubectl apply -f gpu-hpa.yaml
```

[gpu-hpa.yaml](./gpu-hpa.yaml)

# 9. AutoScaling Test

GPU load test

```bash
kubectl apply -f gputest.yml

kubectl scale deployment gputest --replicas=1

```

[gputest.yml](./gputest.yml)


# Uninstall

```bash
kubectl delete -f dcgm-exporter.yaml
kubectl delete -f dcgm-exporter-karpenter.yaml
helm uninstall kube-prometheus-stack -n prometheus
helm uninstall prometheus-operator -n prometheus
helm uninstall prometheus-adapter -n prometheus
```

# Reference

https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/dcgm-exporter.html#integrating-gpu-telemetry-into-kubernetes.html


# ETC

helm repo add gpu-helm-charts https://nvidia.github.io/gpu-monitoring-tools/helm-charts
helm install --generate-name gpu-helm-charts/dcgm-exporter
로 설치시 livness 설정 이슈로 pod 재시작됨
initialDelaySeconds: 20 이상으로 변경 필요