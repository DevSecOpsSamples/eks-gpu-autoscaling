

kubectl proxy &

kubectl port-forward svc/dcgm-exporter 9400:9400 &

kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring &

kubectl port-forward svc/kube-prometheus-stack-grafana 8081:80 -n monitoring &

# killall -9 kubectl