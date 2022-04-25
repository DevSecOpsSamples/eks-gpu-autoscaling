# Debugging Option

## kube-prometheus-stack

```bash
helm inspect values prometheus-community/kube-prometheus-stack > kube-prometheus-stack.myvalues.yaml
```

```bash
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack -f kube-prometheus-stack.myvalues.yaml --install -n monitoring
```
