
# Custom Metric with Prometheus Adapter

## Background

DGCM exporter를 통해 수집되는 label은 아래와 같이 `exported_namespace`, `exported_container`, `exported_pod`로 service 명은 label로 입력되지 않습니다.

전체 label은 [Service Discovery menu](http://localhost:9090/service-discovery)에서 확인 가능합니다. [prom-servicediscovery.png](./screenshots/prom-servicediscovery.png)

```bash
DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}[60s]
```

![prom-dcgm-metric](./screenshots/prom-dcgm-label_01.png?raw=true)

---

## Prometheus Adapter Rule

/apis/custom.metrics.k8s.io/v1beta1 API로 DCGM_FI_DEV_GPU_UTIL metric 값 조회시 n개 node GPU의 합으로 return 되므로 node, service 기준 평균으로 조회하기 위한 custom metric을 생성합니다. 

DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"} 로 저장되는 데이터를 DCGM_FI_DEV_GPU_UTIL_AVG{service="vision-api"} 형태로 조회 할 수 있도록 label을 override합니다

**중요** 

**Service 명과 container 명을 동일하게 지정**하고 **exported_container**로 export 되는 값을 기준으로 service 단위 scaling을 설정합니다.

```yaml
      resources:
        overrides:
          exported_namespace: {resource: "namespace"}
          exported_container: {resource: "service"}
```

PromQL for testing

```bash

DCGM_FI_DEV_GPU_UTIL[5m]

avg by (exported_namespace, exported_container) (round(avg_over_time(DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}[1m])))

max by (exported_namespace, exported_container) (round(max_over_time(DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}[1m])))

```

```yaml
rules:
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
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_MIN"
      resources:
        overrides:
          exported_container: {resource: "service"}
          exported_namespace: {resource: "namespace"}
          exported_pod: {resource: "pod"}
      metricsQuery: min by (exported_namespace, exported_container) (round(min_over_time(<<.Series>>[1m])))
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_MAX"
      resources:
        overrides:
          exported_container: {resource: "service"}
          exported_namespace: {resource: "namespace"}
          exported_pod: {resource: "pod"}
      metricsQuery: max by (exported_namespace, exported_container) (round(max_over_time(<<.Series>>[1m])))
```

[prometheus-adapter-values.yaml](./prometheus-adapter-values.yaml)


## API Response

http://localhost:9090/graph?g0.expr=DCGM_FI_DEV_GPU_UTIL%7Bexported_container%3D%22vision-api%22%7D%5B60s%5D&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=15m

### DCGM_FI_DEV_GPU_UTIL metric

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL" | jq .
```

```json
{
  "kind": "MetricValueList",
  "apiVersion": "custom.metrics.k8s.io/v1beta1",
  "metadata": {
    "selfLink": "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL"
  },
  "items": [
    {
      "describedObject": {
        "kind": "Service",
        "namespace": "default",
        "name": "dcgm-exporter",
        "apiVersion": "/v1"
      },
      "metricName": "DCGM_FI_DEV_GPU_UTIL",
      "timestamp": "2022-04-10T13:46:13Z",
      "value": "92",
      "selector": null
    }
  ]
}
```


```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/DCGM_FI_DEV_GPU_UTIL" | jq .
```

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

### DCGM_FI_DEV_GPU_UTIL_**AVG** metric

**vision-api** service, DCGM_FI_DEV_GPU_UTIL_**AVG** metric 조회

```bash
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
```

```json
{
  "kind": "MetricValueList",
  "apiVersion": "custom.metrics.k8s.io/v1beta1",
  "metadata": {
    "selfLink": "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG"
  },
  "items": [
    {
      "describedObject": {
        "kind": "Service",
        "namespace": "default",
        "name": "vision-api",
        "apiVersion": "/v1"
      },
      "metricName": "DCGM_FI_DEV_GPU_UTIL_AVG",
      "timestamp": "2022-04-10T13:45:32Z",
      "value": "24",
      "selector": null
    }
  ]
}
```

## Enable prometheus-adapter API access log

```bash
helm inspect values stable/prometheus-adapter > prometheus-adapter.myvalues.yaml
```

Open `prometheus-adapter.myvalues.yaml` and update the file for logLevel, prometheus.url, and custom rule.

```yaml
# logLevel: 4
logLevel: 6

metricsRelistInterval: 1m

listenPort: 6443

nodeSelector: {}

priorityClassName: ""

prometheus:
  url: http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local
  port: 9090
  path: ""

rules:
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
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_MIN"
      resources:
        overrides:
          exported_container: {resource: "service"}
          exported_namespace: {resource: "namespace"}
          exported_pod: {resource: "pod"}
      metricsQuery: min by (exported_namespace, exported_container) (round(min_over_time(<<.Series>>[1m])))
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL{exported_namespace!="",exported_container!="",exported_pod!=""}'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_MAX"
      resources:
        overrides:
          exported_container: {resource: "service"}
          exported_namespace: {resource: "namespace"}
          exported_pod: {resource: "pod"}
      metricsQuery: max by (exported_namespace, exported_container) (round(max_over_time(<<.Series>>[1m])))
```

```bash
helm upgrade prometheus-adapter stable/prometheus-adapter -f prometheus-adapter.myvalues.yaml --install -n monitoring
```

```bash
# prometheus-adapter pod logs
I0418 03:15:09.354353       1 handler.go:143] prometheus-metrics-adapter: GET "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG" satisfied by gorestful with webservice /apis/custom.metrics.k8s.io/v1beta1
I0418 03:15:09.356077       1 api.go:74] GET http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local:9090/api/v1/query?query=avg+by+%28exported_namespace%2C+exported_container%29+%28round%28avg_over_time%28DCGM_FI_DEV_GPU_UTIL%5B1m%5D%29%29%29&time=1650262855.882 200 OK
I0418 03:15:09.356239       1 provider.go:161] Got more than one result (3 results) when fetching metric services/DCGM_FI_DEV_GPU_UTIL_AVG(namespaced) for "default/vision-api", using the first one with a matching name...
I0418 03:15:09.356392       1 httplog.go:90] GET /apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG: (6.955411ms) 200 [kube-controller-manager/v1.20.15 (linux/amd64) kubernetes/a8ff023/system:serviceaccount:kube-system:horizontal-pod-autoscaler 10.1.95.12:34728]
I0418 03:15:09.367908       1 round_trippers.go:443] POST https://172.20.0.1:443/apis/authorization.k8s.io/v1/subjectaccessreviews 201 Created in 2 milliseconds
```

```bash
http://127.0.0.1:9090/api/v1/query?query=avg+by+%28exported_namespace%2C+exported_container%29+%28round%28avg_over_time%28DCGM_FI_DEV_GPU_UTIL%5B1m%5D%29%29%29&time=1650262855.882
```

```yaml
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "exported_container": "vision-api",
          "exported_namespace": "default"
        },
        "value": [
          1650262855.882,
          "19.666666666666664"
        ]
      },
      {
        "metric": {
          "exported_container": "vision-api2",
          "exported_namespace": "default"
        },
        "value": [
          1650262855.882,
          "0"
        ]
      }
    ]
  }
}
```
