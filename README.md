
# GPU AutoScaling on EKS

GPU utilization based horizontal autoscaling for inference APIs.

This guideline provides a complete steps for GPU auto scaling on AWS EKS.

## Introduction

There are differences between CPU scaling and GPU scaling for cluster-level and pod-level like the following:

#### CPU scaling vs GPU scaling ####

|              | CPU        | GPU           | Description                         |
|--------------|------------|---------------|-------------------------------------|
| Metric       | Supported  | Not Supported | `DCGM exporter` daemonset is required to collect GPU metrics because it's not collected through the Metric Server by default. |
| HPA          | Supported  | Not Supported | Horizontal Pod Autoscaling(HPA) for GPU working based on `Prometheus` customer metrics.  |
| Fraction     | Supported  | Not Supported | GPU resource fraction is not supported such as 'nvidia.com/gpu: 0.5'. |

#### Objectives: ####

* Install the Data Center GPU Manager(DCGM) exporter as daemonset and scale pods through HPA which works based on Prometheus custom metric.
* GPU cluster autoscaling with CA or Karpenter
* `Pod-level` GPU autoscaling
* 2 node groups: 1 CPU node group, 1 GPU node group has `accelerator: nvidia-gpu` label. Inference API applications are running in `shared one GPU node group` to not to create clusters per GPU application. 

#### Environment: ####

| SW                 | Version | Desc   |
|--------------------|---------|-------|
| CDK                | 2.20.0  |  |
| EKS                | 1.21    | [version](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/kubernetes-versions.html)  |
| DCGM               | 2.65    |  |
| Prometheus         | 2.34.0  |  |
| Prometheus Adapter | 2.5.1   |  |
| Grafana            | 6.24.1  |  |

## Prequisets

The EKS Blueprint is used for minimum steps for EKS cluter and add-on.

[Create a cluster with EKS Blueprint](./cdk/README.md):

* VPC
* EKS cluster & nodegroup
* Cluster AutoScaler(CA) Addon
* AWS Load Balancer Controller Addon
* Kubernetes Dashboard

If you want to use the existing cluster or create a cluster by using `eksctl`, refer to the [eksctl/README.md](./eksctl/README.md) page.

## Steps

1. Deploy DCGM exporter daemonset
2. Install Prometheus Stack
3. Install Prometheus Adapter with custom metric configuration
4. Create Grafana Dashboards
5. Deploy inference API and GPU HPA
6. AutoScaling Test

# Install

# Step 1: DCGM exporter

## 1. Install DCGM exporter as DaemonSet

```bash
kubectl apply -f dcgm-exporter.yaml
```

* [dcgm-exporter.yaml](./dcgm-exporter.yaml)

```bash
kubectl apply -f dcgm-exporter-karpenter.yaml
```

* [dcgm-exporter-karpenter.yaml](./dcgm-exporter-karpenter.yaml)

Deploy with a local yaml file instead of Helm to use the ServiceMonitor for Service Discovery. Scrape configurations can be added in [additionalScrapeConfigs](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config) element when installing Prometheus, but we will use ServiceMonitor to deploy configuration per K8s Service.

```bash
kubectl get servicemonitor dcgm-exporter -o yaml
```

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

Karpenter

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

Retrive DCGM_FI_DEV_GPU_UTIL metric:

```bash
kubectl port-forward svc/dcgm-exporter 9400:9400
```

http://localhost:9400/metrics

```bash
curl http://localhost:9400/metrics | grep DCGM_FI_DEV_GPU_UTIL
```

Response example:

```bash
DCGM_FI_DEV_GPU_UTIL{gpu="0",UUID="GPU-74f7fe3b-48f2-6d8b-3cb4-e70426fb669c",device="nvidia0",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
DCGM_FI_DEV_GPU_UTIL{gpu="1",UUID="GPU-f3a2185e-464d-c671-4057-0d056df64b6e",device="nvidia1",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
DCGM_FI_DEV_GPU_UTIL{gpu="2",UUID="GPU-6ae74b72-48d0-f09f-14e2-4e09ceebda63",device="nvidia2",modelName="Tesla K80",Hostname="dcgm-exporter-cmhft",container="",namespace="",pod=""} 0
```

# Step 2: Install Prometheus Stack

4 major stacks are included in `kube-prometheus-stack` stack:

* Prometheus Server
* Prometheus Operator
* Metric Server
* Grafana

```bash

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring
```

http://localhost:9090/targets

![promethus target](./screenshots/dcgm.png?raw=true)

# Step 3:  Install prometheus-adapter for custom metric

Check a service name to configure the internal DNS setting of `prometheus.url` parameter:

```bash
kubectl get svc -lapp=kube-prometheus-stack-prometheus -n monitoring
```

prometheus.url format: `http://<service-name>.<namespace>.svc.cluster.local`

e.g.,

* `http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local`
* `http://kube-prometheus-stack-prometheus.prometheus.svc.cluster.local`

Install prometheus-adapter:

```bash
helm install prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-values.yaml
```

[prometheus-adapter-values.yaml](./prometheus-adapter-values.yaml)

```bash
  custom:
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_AVG"
      resources:
        overrides:
          exported_namespace: {resource: "namespace"}
          exported_container: {resource: "service"}
          exported_pod: {resource: "pod"}
      metricsQuery: avg by (exported_namespace, exported_container) (round(avg_over_time(<<.Series>>[1m])))
```

Override the label to retrive with DCGM_FI_DEV_GPU_UTIL_AVG{`service="gpu-api"`} that saved as DCGM_FI_DEV_GPU_UTIL{`exported_container="gpu-api"`}. For details about prometheus-adapter rule, how works, and how to check the /api/v1/query API logs, refer to the [CustomMetric](./CustomMetric.md) page.

---

Retrive custom metrics:

```bash
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq -r . | grep DCGM_FI_DEV_GPU_UTIL
```

```bash
      "name": "services/DCGM_FI_DEV_GPU_UTIL",
      "name": "namespaces/DCGM_FI_DEV_GPU_UTIL",
      "name": "jobs.batch/DCGM_FI_DEV_GPU_UTIL",
      "name": "pods/DCGM_FI_DEV_GPU_UTIL",
      "name": "services/DCGM_FI_DEV_GPU_UTIL_AVG",
      "name": "namespaces/DCGM_FI_DEV_GPU_UTIL_AVG",
      "name": "jobs.batch/DCGM_FI_DEV_GPU_UTIL_AVG",
      "name": "pods/DCGM_FI_DEV_GPU_UTIL_AVG",
      ...
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/DCGM_FI_DEV_GPU_UTIL" | jq .
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL" | jq .
```

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
```

If there is no value, connect to the DCGM exporter pod, and check connectivity with `wget http://<prometheus-url>:<port>`.

# Step 4: Import Grafana Dashboards

```bash
kubectl port-forward svc/kube-prometheus-stack-grafana 8081:80 -n monitoring
```

```bash
kubectl get secret --namespace prometheus kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

http://localhost:8081

Import dashboards

* [NVIDIA DCGM Exporter Dashboard](https://grafana.com/grafana/dashboards/12239) ID: 12239
* [1 Kubernetes All-in-one Cluster Monitoring KR](https://grafana.com/grafana/dashboards/13770) ID: 13770

![grafana-dcgm](./screenshots/grafana-dcgm-01.png?raw=true)

## Step 5: Deploy Inference API and HPA

### 1. Install Metrics Server

```bash
helm install metrics-server stable/metrics-server -n kube-system
```

### 2. Deploy CPU API

```bash
kubectl apply -f cpu-api.yaml
```

[cpu-api.yaml](./cpu-api.yaml)

### 3. Deploy GPU API

```bash
kubectl apply -f gpu-api.yaml
```

```bash
kubectl apply -f gpu-api2.yaml
```

image size: 3.33GB, image pull: 39.50s

[gpu-api.yaml](./gpu-api.yaml)

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: gpu-api-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gpu-api # <-- service name
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Object
    object:
      metric:
        name: DCGM_FI_DEV_GPU_UTIL_AVG
      describedObject:
        kind: Service
        name: gpu-api # <-- service name
      target:
        type: Value
        value: '30'
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-api
  namespace: default
  annotations:
    app: 'gpu-api'
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gpu-api
  template:
    metadata:
      labels:
        app: gpu-api
    spec:
      containers:
        - name: gpu-api  # Set container name and service name with same name
          image: 123456789.dkr.ecr.ap-northeast-2.amazonaws.com/gpu-cuda-api:latest
          imagePullPolicy: Always
```

```bash
kubectl get hpa cpu-api-hpa -w
kubectl get hpa gpu-api-hpa -w
kubectl get hpa gpu-api2-hpa -w

```

## prometheus-alert-rule.yaml

```bash
kubectl apply -f prometheus-alert-rule.yaml
```

[prometheus-alert-rule.yaml](./prometheus-alert-rule.yaml)

# Step 6: AutoScaling Test

```bash
bzt gpu-api-bzt.yaml
```

```bash
# $JMETER_HOME/bin
./jmeter -t gpu-api.jmx -n  -j ../log/jmeter.log
```

[gpu-api.jmx](./gpu-api.jmx)

![prom-dcgm-metric](./screenshots/prom-dcgm-metric.png?raw=true)

![scalingtest-taurus.png](./screenshots/scalingtest-taurus.png?raw=true)

```bash
kubectl describe hpa gpu-api-gpu-hpa
```

```bash
Name:                                                               gpu-api-gpu-hpa
Namespace:                                                          default
Labels:                                                             <none>
Annotations:                                                        app: gpu-api
CreationTimestamp:                                                  Sun, 10 Apr 2022 21:09:59 +0900
Reference:                                                          Deployment/gpu-api
Metrics:                                                            ( current / target )
  "DCGM_FI_DEV_GPU_UTIL_AVG" on Service/gpu-api (target value):  11 / 20
Min replicas:                                                       2
Max replicas:                                                       12
Deployment pods:                                                    8 current / 8 desired
Conditions:
  Type            Status  Reason               Message
  ----            ------  ------               -------
  AbleToScale     True    ScaleDownStabilized  recent recommendations were higher than current one, applying the highest recent recommendation
  ScalingActive   True    ValidMetricFound     the HPA was able to successfully calculate a replica count from Service metric DCGM_FI_DEV_GPU_UTIL_AVG
  ScalingLimited  False   DesiredWithinRange   the desired count is within the acceptable range
Events:
  Type    Reason             Age   From                       Message
  ----    ------             ----  ----                       -------
  Normal  SuccessfulRescale  53m   horizontal-pod-autoscaler  New size: 5; reason: Service metric DCGM_FI_DEV_GPU_UTIL_AVG above target
  Normal  SuccessfulRescale  44m   horizontal-pod-autoscaler  New size: 6; reason: Service metric DCGM_FI_DEV_GPU_UTIL_AVG above target
  Normal  SuccessfulRescale  41m   horizontal-pod-autoscaler  New size: 8; reason: Service metric DCGM_FI_DEV_GPU_UTIL_AVG above target
```

```bash
kubectl get events -w
kubectl describe deploy gpu-api

kubectl describe apiservices v1beta1.metrics.k8s.io
kubectl get endpoints metrics-server -n kube-system
kubectl logs -n kube-system -l k8s-app=metrics-server

kubectl scale deployment gpu-api --replicas=6
```

# Uninstall

```bash
kubectl delete -f cpu-api.yaml
kubectl delete -f gpu-api.yaml
kubectl delete -f gpu-api2.yaml

kubectl delete -f dcgm-exporter.yaml
kubectl delete -f dcgm-exporter-karpenter.yaml
kubectl delete -f prometheus-alert-rule.yaml

helm uninstall prometheus-adapter
helm uninstall kube-prometheus-stack -n monitoring

helm uninstall metrics-server stable/metrics-server -n kube-system
```

# Reference

[NVIDIA doc DCGM-Exporter](https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/dcgm-exporter.html)

https://github.com/kubernetes-sigs/prometheus-adapter

https://aws.amazon.com/ko/blogs/machine-learning/monitoring-gpu-utilization-with-amazon-cloudwatch/

# Trouble Shooting

# ETC

Sharing GPU in Kubernetes
https://www.bytefold.com/sharing-gpu-in-kubernetes/