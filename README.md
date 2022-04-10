
# Summary

Kubernetes Cluster AutoScaler(CA), Karpenter 를 사용한 GPU AutoScaling guide

Data Center GPU Manager(DCGM) exporter를 DaemonSet으로 설치하고 Prometheus custom metric을 기준으로 작동하는 Horizontal Pod Autoscaling(HPA)를 통해 Pod를 scaling 합니다.

* EKS cluster & nodegroup 생성
* Kubernetes Dashboard 설치
* [Cluster AutoScaler(CA), AWS Load Balancer Controller 설치](./ClusterAutoScalerAndALB.md)

1. Data Center GPU Manager(DCGM) exporter DaemonSet 배포
2. Prometheus Stack 설치
3. Prometheus custom metric 생성
4. Grafana Dashboard Import
5. Inference Test API 배포
6. GPU Horizontal Pod Autoscaling(HPA) 배포
7. AutoScaling Test

## CPU scaling vs GPU scling 

|              | CPU   | GPU   | Description                         |
|--------------|-------|-------|-------------------------------------|
| Metric 수집   | 지원   |  미지원 | DCGM exporter DaemonSet으로 수집      |
| Fraction     | 지원   |  미지원 | nvidia.com/gpu: 0.5 형태로 설정 불가   |
| HPA          | 지원   |  미지원 | prometheus customer metric 기준 scaling    |

# Environment

* EKS 1.21 - [버전](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/kubernetes-versions.html)
* DCGM 2.65
* Prometheus
* Prometheus Adapter-2.5.1
* Grafana 6.24.1

# 1. EKS cluster & nodegroup

## 1.1 eksctl

```bash
eksctl create cluster -f gpu-cluster.yaml --without-nodegroup
eksctl create nodegroup -f gpu-cluster-ng.yaml
```

* [gpu-cluster.yaml](./gpu-cluster.yaml)
* [gpu-cluster-ng.yaml](./gpu-cluster-ng.yaml)

Seoul region ap-northeast-2b Zone은 GPU 인스턴스 생성 불가하므로 cluster 생성시 제외합니다.

cluster 13분, Manged Node Group 10분 정도 소요됩니다.

---

## 1.2 WebConsole에서 Kubernetes objects 조회를 위한 IAM identity mapping 생성

```bash
eksctl create iamidentitymapping --cluster <CluterName> --arn arn:aws:iam::<YourAwsAccountId>:role/<YourRoleName> --group system:masters --username admin --region ap-northeast-2
```

# 2. Kubernetes Dashboard 설치 (Optional)

[자습서: Kubernetes 대시보드 배포(웹 UI)](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/dashboard-tutorial.html)

![k8s-dashboard](./screenshots/k8s-dashboard.png?raw=true)

# 3. DCGM exporter DaemonSet

## 3.1 exporter 설치 - 2.6.5 version

```bash
kubectl apply -f dcgm-exporter.yaml
```

```bash
kubectl apply -f dcgm-exporter-karpenter.yaml
```

* [dcgm-exporter.yaml](./dcgm-exporter.yaml)

* [dcgm-exporter-karpenter.yaml](./dcgm-exporter-karpenter.yaml)

option에 대한 상세한 내용은  [NVIDIA doc DCGM-Exporter](./https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/dcgm-exporter.html) 페이지를 참고하시기 바랍니다.

Service Dicovery를 위한 ServiceMonitor 사용하기 위해 helm 대신 local yaml 파일로 배포합니다. additionalScrapeConfigs 설정에 [job_name](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)을 추가해 사용 가능하나 service 단위로 configuration을 배포하기 위해  ServiceMonitor를 사용합니다.

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

Cluster Autoscaler(CA)

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

## 3.2 Metric 값 확인

```bash
kubectl port-forward svc/dcgm-exporter 9400:9400
```

http://localhost:9400/metrics

```bash
curl http://localhost:9400/metrics | grep DCGM_FI_DEV_GPU_UTIL
```

response example:

```bash
DCGM_FI_DEV_GPU_UTIL{gpu="0",UUID="GPU-74f7fe3b-48f2-6d8b-3cb4-e70426fb669c",device="nvidia0",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
DCGM_FI_DEV_GPU_UTIL{gpu="1",UUID="GPU-f3a2185e-464d-c671-4057-0d056df64b6e",device="nvidia1",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
DCGM_FI_DEV_GPU_UTIL{gpu="2",UUID="GPU-6ae74b72-48d0-f09f-14e2-4e09ceebda63",device="nvidia2",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
```

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

```bash
helm install prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-values.yaml
```

[prometheus-adapter-values.yaml](./prometheus-adapter-values.yaml)

prometheus.url format: `http://<service-name>.<namespace>.svc.cluster.local`

e.g.,

* `http://kube-prometheus-stack-prometheus.prometheus.svc.cluster.local`
* `http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local`

prometheus-adapter log 확인

```bash
TODO
```

## 5.2 custom metric 확인

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq -r . | grep DCGM_FI_DEV_GPU_UTIL
```

reponse example:

```bash
      "name": "services/DCGM_FI_DEV_GPU_UTIL",
      "name": "namespaces/DCGM_FI_DEV_GPU_UTIL",
      "name": "jobs.batch/DCGM_FI_DEV_GPU_UTIL",
      "name": "pods/DCGM_FI_DEV_GPU_UTIL",
      ...
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/DCGM_FI_DEV_GPU_UTIL" | jq .

kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL" | jq .
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
```

reponse example:

```json
{
  "kind": "MetricValueList",
  "apiVersion": "custom.metrics.k8s.io/v1beta1",
  "metadata": {
    "selfLink": "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/%2A/DCGM_FI_DEV_GPU_UTIL"
  },
  "items": [
    {
      "describedObject": {
        "kind": "Pod",
        "namespace": "default",
        "name": "dcgm-exporter-2fcbn",
        "apiVersion": "/v1"
      },
      "metricName": "DCGM_FI_DEV_GPU_UTIL",
      "timestamp": "2022-04-08T16:56:47Z",
      "value": "25",
      "selector": null
    },
    {
      "describedObject": {
        "kind": "Pod",
        "namespace": "default",
        "name": "dcgm-exporter-7pwxw",
        "apiVersion": "/v1"
      },
      "metricName": "DCGM_FI_DEV_GPU_UTIL",
      "timestamp": "2022-04-08T16:56:47Z",
      "value": "24",
      "selector": null
    }
}
```


값이 없는 경우 DCGM export pod로 들어가 `wget http://prometheus-url:port` 로 정상 접속되는지 확인합니다.

# 6. Grafana Dashboard import

```bash
kubectl port-forward svc/kube-prometheus-stack-grafana 8081:80 -n prometheus
```

```bash
kubectl get secret --namespace prometheus kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

http://localhost:8081

Dashboard import

* [NVIDIA DCGM Exporter Dashboard](https://grafana.com/grafana/dashboards/12239) ID: 12239
* [1 Kubernetes All-in-one Cluster Monitoring KR](https://grafana.com/grafana/dashboards/13770) ID: 13770

![grafana-dcgm](./screenshots/grafana-dcgm-01.png?raw=true)

# 7. Inference API & GPU HPA 배포

```bash
kubectl apply -f vision-api.yaml
```

vision-api.yaml는 Deployment, Service, Ingress, HorizontalPodAutoscaler 를 배포합니다. AWS Load Balancer Controller 설치를 위한 setup은 [ClusterAutoScalerAndALB.md](./ClusterAutoScalerAndALB.md)를 참고하시기 바랍니다.

image size: 3.33GB, image pull: 39.50s

[vision-api.yaml](./vision-api.yaml)

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: vision-api-gpu-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vision-api
  minReplicas: 2
  maxReplicas: 12
  metrics:
  - type: Object
    object:
      metric:
        name: DCGM_FI_DEV_GPU_UTIL_AVG
      describedObject:
        kind: Service
        name: dcgm-exporter
      target:
        type: Value
        value: '30'
```

## prometheus-alert-rule.yaml

```bash
kubectl apply -f prometheus-alert-rule.yaml
```

[prometheus-alert-rule.yaml](./prometheus-alert-rule.yaml)

# 9. AutoScaling Test

```bash
bzt vision-api-bzt.yaml
```

```bash
# $JMETER_HOME/bin
./jmeter -t vision-api.jmx -n  -j ../log/jmeter.log
```

[vision-api.jmx](./vision-api.jmx)

![prom-dcgm-metric](./screenshots/prom-dcgm-metric.png?raw=true)

![scalingtest-taurus.png](./screenshots/scalingtest-taurus.png?raw=true)

```bash
kubectl describe hpa vision-api-gpu-hpa
```

```bash
Name:                                                              vision-api-gpu-hpa
Namespace:                                                         default
Labels:                                                            <none>
Annotations:                                                       <none>
CreationTimestamp:                                                 Wed, 06 Apr 2022 23:21:19 +0900
Reference:                                                         Deployment/vision-api
Metrics:                                                           ( current / target )
  "DCGM_FI_DEV_GPU_UTIL_AVG" on Service/dcgm-exporter (target value):  0 / 30
Min replicas:                                                      1
Max replicas:                                                      12
Deployment pods:                                                   1 current / 1 desired
Conditions:
  Type            Status  Reason            Message
  ----            ------  ------            -------
  AbleToScale     True    ReadyForNewScale  recommended size matches current size
  ScalingActive   True    ValidMetricFound  the HPA was able to successfully calculate a replica count from Service metric DCGM_FI_DEV_GPU_UTIL_AVG
  ScalingLimited  True    TooFewReplicas    the desired replica count is less than the minimum replica count
Events:           <none>
```


```bash
kubectl get events -w

kubectl describe deploy vision-api

kubectl describe apiservices v1beta1.metrics.k8s.io
kubectl get endpoints metrics-server -n kube-system
kubectl logs -n kube-system -l k8s-app=metrics-server

kubectl scale deployment vision-api --replicas=6
kubectl get events -w
```

# Uninstall

```bash

kubectl delete -f vision-api.yaml
kubectl delete hpa vision-api-gpu-hpa

kubectl delete -f dcgm-exporter.yaml
kubectl delete -f dcgm-exporter-karpenter.yaml
kubectl delete -f prometheus-alert-rule.yaml

helm uninstall prometheus-adapter
helm uninstall kube-prometheus-stack -n prometheus
```

# Reference
DCGM-Exporter
https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/dcgm-exporter.html

https://github.com/kubernetes-sigs/prometheus-adapter

https://aws.amazon.com/ko/blogs/machine-learning/monitoring-gpu-utilization-with-amazon-cloudwatch/

# Trouble Shooting

# ETC

helm repo add gpu-helm-charts https://nvidia.github.io/gpu-monitoring-tools/helm-charts
helm install --generate-name gpu-helm-charts/dcgm-exporter
로 설치시 livness 설정 이슈로 pod 재시작됨
initialDelaySeconds: 20 이상으로 변경 필요


Sharing GPU in Kubernetes
https://www.bytefold.com/sharing-gpu-in-kubernetes/