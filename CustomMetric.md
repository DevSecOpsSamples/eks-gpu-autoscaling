
# Custom Metric with Prometheus Adapter

## Background

DGCM exporter를 통해 수집되는 label은 아래와 같이 exported_container, exported_service에 K8s Service가 입력됩니다.

전체 label은 [Service Discovery menu](http://localhost:9090/service-discovery)에서 확인 가능합니다. [prom-servicediscovery.png](./screenshots/prom-servicediscovery.png)

```bash
DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}[60s]
```

![prom-dcgm-metric](./screenshots/prom-dcgm-label_01.png?raw=true)

---

## Prometheus Adapter Rule

/apis/custom.metrics.k8s.io/v1beta1 API로 DCGM_FI_DEV_GPU_UTIL metric 값 조회시 n개 node GPU의 합으로 출력되므로 node, service 기준 avg로 조회하기 위한 custom metric을 생성합니다.

DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"} 로 저장되는 데이터를 DCGM_FI_DEV_GPU_UTIL_AVG{service="vision-api"} 형태로 조회 할 수 있도록 label을 override합니다

```bash
  custom:
    - seriesQuery: 'DCGM_FI_DEV_GPU_UTIL'
      name:
        as: "DCGM_FI_DEV_GPU_UTIL_AVG"
      metricsQuery: ceil(avg_over_time(<<.Series>>{<<.LabelMatchers>>}[60s]))
      resources:
        overrides:
          exported_namespace: {resource: "namespace"}
          exported_container: {resource: "service"}
          exported_pod: {resource: "pod"}
```

[prometheus-adapter-values.yaml](./prometheus-adapter-values.yaml)


## 참고

DCGM_FI_DEV_GPU_UTIL metric 값은 value와 같이 n개 node GPU의 합으로 출력됩니다.

http://localhost:9090/graph?g0.expr=DCGM_FI_DEV_GPU_UTIL%7Bexported_container%3D%22vision-api%22%7D%5B60s%5D&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=15m

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
