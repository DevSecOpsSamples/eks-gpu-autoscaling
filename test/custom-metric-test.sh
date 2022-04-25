#!/bin/bash

a=0
while [ "$a" -lt 100000 ]
do
    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_MIN" | jq .
    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_MAX" | jq .

    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api2/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_MIN" | jq .
    # kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_MAX" | jq .

    kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_AVG" | jq .
    kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/services/gpu-api/DCGM_FI_DEV_GPU_UTIL_SUM" | jq .
    
    sleep 1
done