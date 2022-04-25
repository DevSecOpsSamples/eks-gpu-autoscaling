```bash
#1 prometheus
# 0.96s user 0.59s system 4% cpu 33.316 total
time helm upgrade prometheus prometheus-community/prometheus -f ./values.yaml -n prometheus --create-namespace --install

kubectl get svc prometheus-server -n prometheus
# or kubectl get svc -l "app=prometheus,component=server" -n monitoring

#2 
helm upgrade prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-op-values.yaml --install -n prometheus

helm delete prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-op-values.yaml --install

# 3
kubectl apply -f vision-api.yaml
kubectl apply -f vision-api.yaml

helm uninstall prometheus -n monitoring
helm uninstall prometheus-adapter


kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml 
kubectl replace -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml

kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml -n monitoring
kubectl replace -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml -n monitoring

kubectl create https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml -n monitoring

# prometheus-community/kube-prometheus-stack chart
# prometheus-community/prometheus chart
# kube-prometheus

    url: http://prometheus-server.monitoring.svc.cluster.local
https://github.com/prometheus-operator/kube-prometheus
''


helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus -f kube-prometheus-stack.values.yaml


helm upgrade prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-values.yaml --install

helm upgrade prometheus-adapter stable/prometheus-adapter -f ./test/prometheus-adapter-values-testyaml


kube-prometheus-stack.values.yaml

kubectl describe pod/prometheus-kube-prometheus-stack-prometheus-0 -n prometheus


helm inspect values prometheus-community/kube-prometheus-stack > kube-prometheus-stack.myvalues.yaml

helm inspect values stable/prometheus-adapter > prometheus-adapter.myvalues.yaml

helm uninstall kube-prometheus-stack

helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack -f kube-prometheus-stack.myvalues.yaml -n prometheus --dry-run --debug


helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n prometheus
```

--dry-run --debug

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

--web.enable-admin-api

http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/pod/prometheus/prometheus-kube-prometheus-stack-prometheus-0?namespace=prometheus&container=prometheus
--web.console.templates=/etc/prometheus/consoles
--web.console.libraries=/etc/prometheus/console_libraries
--storage.tsdb.retention.time=10d
--config.file=/etc/prometheus/config_out/prometheus.env.yaml
--storage.tsdb.path=/prometheus
--web.enable-lifecycle
--web.external-url=http://kube-prometheus-stack-prometheus.prometheus:9090
--web.route-prefix=/
--web.config.file=/etc/prometheus/web_config/web-config.yaml



https://godekdls.github.io/Prometheus/overview/

curl localhost:9090/api/v1/query?query=cuda_test_gpu_avg

curl -X POST -g '[http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}](http://localhost:9090/api/v1/admin/tsdb/delete_series?match%5B%5D=%7B__name__=~%22.+%22%7D)'

curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series

http://localhost:9090/api/v1/admin/tsdbdelete_series

http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/configmap/default/prometheus-adapter?namespace=default

https://git.app.uib.no/caleno/helm-charts/tree/bcc4aaf2d32511cd0b6fc0cf3dbd129ed929df0d/stable/prometheus-adapter

helm inspect values stable/prometheus-adapter > prometheus-adapter.values.yaml


#helm install prometheus-adapter --set rbac.create=true,prometheus.url=http://kube-prometheus-stack-prometheus.prometheus.svc.cluster.local,prometheus.port=9090 stable/prometheus-adapter

#helm install --name my-release -f values.yaml stable/prometheus-adapter


#helm uninstall prometheus-adapter
#helm install prometheus-adapter --set rbac.create=true,logLevel=5,prometheus.url=http://kube-prometheus-stack-prometheus.prometheus.svc.cluster.local,prometheus.port=9090 stable/prometheus-adapter




kubectl get --raw  /apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL_AVG

kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/*/metrics/DCGM_FI_DEV_GPU_UTIL

curl localhost:9400/api/v1/query?query=DCGM_FI_DEV_GPU_UTIL
curl localhost:9400/api/v1/query?query=DCGM_FI_DEV_GPU_UTIL_AVG

    # path: ""
    # additionalScrapeConfigs:
    # - job_name: gpu-metrics'
    #     scrape_interval: 1s
    #     metrics_path: /metrics
    #     scheme: http
    #     kubernetes_sd_configs:
    #     - role: endpoints
    #     namespaces:
    #         names:
    #         - gpu-operator
    #     relabel_configs:
    #     - source_labels: [__meta_kubernetes_pod_node_name]
    #     action: replace
    #     target_label: kubernetes_node


  # k explain HorizontalPodAutoscaler.spec.metrics.type  --api-version=autoscaling/v2beta2
  # https://www.kloia.com/blog/advanced-hpa-in-kubernetes
#  behavior:
#     scaleDown:
#       selectPolicy: Disabled
#     scaleUp:
#       stabilizationWindowSeconds: 120
#       policies:
#       - type: Percent
#         value: 10
#         periodSeconds: 60
#       - type: Pods
#         value: 4
#         periodSeconds: 60
#       selectPolicy: Max



   # object:
    #   target:
    #     kind: Service
    #     name: dcgm-exporter
    #   metricName: DCGM_FI_DEV_GPU_UTIL
    #   targetValue: 30
      # metricName: DCGM_FI_DEV_GPU_UTIL
      # targetValue: 30
      # metric: DCGM_FI_DEV_GPU_UTIL
      # type:
    # - type: ContainerResource
    #   containerResource:
    #     name: gpu
    #     container: your-application-container
    #     target:
    #       type: Utilization
    #       averageUtilization: 60
    # - type: External
    #   external:
    #     metric:
    #       name: kubernetes.io|container|accelerator|duty_cycle
    #       selector:
    #         matchLabels:
    #           resource.labels.container_name: gpu-container-name
    #     target:
    #       type: AverageValue
    #       averageValue: 80
    # - type: Resource
    #   resource:
    #     name: cpu
    #     target:
    #       type: Utilization
    #       averageUtilization: 80



https://godekdls.github.io/Prometheus/overview/

https://kubernetes-docsy-staging.netlify.app/ko/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/


nvidia-ml-py

DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}

avg_over_time(DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}[30s])

ceil(avg(avg_over_time(DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}[1m])))
ceil(avg(avg_over_time(DCGM_FI_DEV_GPU_UTIL{exported_container="vision-api"}[15s])))


kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/dcgm-exporter/DCGM_FI_DEV_GPU_UTIL" | jq .




kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .


ceil(avg_over_time(DCGM_FI_DEV_GPU_UTIL{exported_namespace="default",exported_container="vision-api"}[60s]))


unable to fetch metrics from prometheus: bad_data: invalid parameter "query": 1:95: parse error: unexpected <by>
I0410 16:39:00.764619       1 httplog.go:90] GET /apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/vision-api/DCGM_FI_DEV_GPU_UTIL_AVG2: (1.807057ms) 500
goroutine 2615 [running]:

ceil(avg(DCGM_FI_DEV_GPU_UTIL{exported_namespace="default",exported_container="vision-api"}))