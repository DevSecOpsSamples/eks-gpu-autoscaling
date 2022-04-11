

kubectl apply -f dcgm-exporter.yaml

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
   --create-namespace --namespace prometheus \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

helm install prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-values.yaml

helm upgrade prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-values.yaml

#helm upgrade prometheus-adapter stable/prometheus-adapter -f kube-prometheus-stack.values.yaml


kubectl apply -f vision-api.yaml

kubectl apply -f vision-api2.yaml

kubectl apply -f hpa.yaml