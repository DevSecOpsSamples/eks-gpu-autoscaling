

kubectl apply -f dcgm-exporter.yaml

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

kubectl apply -f prometheus-adapter-values.yaml

kubectl apply -f vision-api.yaml