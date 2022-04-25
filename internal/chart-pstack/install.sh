


group by (exported_namespace, exported_container) (max_over_time(DCGM_FI_DEV_GPU_UTIL{exported_namespace="vision-api",exported_container!="",exported_pod!=""}[10m]))



--listen-address=:8080
--reload-url=http://127.0.0.1:9090/-/reload
--config-file=/etc/prometheus/config/prometheus.yaml.gz
--config-envsubst-file=/etc/prometheus/config_out/prometheus.env.yaml
--watched-dir=/etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0

mkdir /etc/prometheus/config/ -p
ls -alh /etc/prometheus/config/prometheus.yaml.gz

cp /etc/prometheus/config_out/prometheus.env.yaml

kubectl apply -f dcgm-exporter.yaml

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm search repo kube-prometheus
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia \
   && helm repo update

time helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack --install \
   --create-namespace --namespace monitoring \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false,grafana.enabled=false

time helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack --install \
   --create-namespace --namespace monitoring \
   --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false


#####
helm upgrade prometheus-adapter stable/prometheus-adapter -f prometheus-adapter-chart-pstack.yaml --install --namespace monitoring

kubectl apply -f vision-api-chart-pstack.yaml



curl http://localhost:9090/api/v1/status/tsdb | jq .

<cluter-name>=gpu-chart-pstack

image
https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch



681747700094 / webconsole (Not Production Account)

eksctl create iamidentitymapping --cluster gpu-chart-pstack --arn arn:aws:iam::681747700094:role/webconsole --group system:masters --username admin --region ap-northeast-2

==========

export AWS_REGION="ap-northeast-2"

eksctl utils associate-iam-oidc-provider --approve --cluster gpu-chart-pstack 

aws iam create-policy \
    --policy-name AmazonEKSClusterAutoscalerPolicy \
    --policy-document file://cluster-autoscaler-policy.json

eksctl create iamserviceaccount \
  --cluster=gpu-chart-pstack \
  --namespace=kube-system \
  --name=cluster-autoscaler \
  --attach-policy-arn=arn:aws:iam::681747700094:policy/AmazonEKSClusterAutoscalerPolicy \
  --override-existing-serviceaccounts \
  --approve

# cluster-autoscaler-autodiscover.yaml <YOUR CLUSTER NAME> 부분 변경
curl -o cluster-autoscaler-autodiscover.yaml https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
kubectl apply -f cluster-autoscaler-autodiscover.yaml

# 로그 확인
kubectl logs -n kube-system  -f deployment/cluster-autoscaler

# should be checked
kubectl annotate deployment.apps/cluster-autoscaler cluster-autoscaler.kubernetes.io/safe-to-evict="false" -n kube-system

kubectl version --short | grep 'Server Version:' | sed 's/[^0-9.]*\([0-9.]*\).*/\1/' | cut -d. -f1,2


aws eks describe-cluster --name gpu-chart-pstack --query "cluster.identity.oidc.issuer" --output text
https://oidc.eks.ap-northeast-2.amazonaws.com/id/C467B1369F080F13DF5D74205F090D6A

aws iam list-open-id-connect-providers | grep C467B1369F080F13DF5D74205F090D6A

# "Arn": "arn:aws:iam::<account-id>:oidc-provider/oidc.eks.ap-northeast-2.amazonaws.com/id/E7027A45F2989B456FF1F485FD367E57"

curl -o alb_iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json
# curl -o alb_iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://alb_iam_policy.json

eksctl create iamserviceaccount \
    --cluster gpu-chart-pstack \
    --namespace kube-system \
    --name aws-load-balancer-controller \
    --attach-policy-arn arn:aws:iam::681747700094:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve

helm repo add eks https://aws.github.io/eks-charts
helm repo update

kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.5.4/cert-manager.yaml
curl -Lo v2_4_0_full.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.4.0/v2_4_0_full.yaml
# replace cluster name
sed -i.bak -e 's|your-cluster-name|gpu-chart-pstack|' ./v2_4_0_full.yaml
kubectl apply -f v2_4_0_full.yaml

kubectl get deployment -n kube-system aws-load-balancer-controller

# log 확인
kubectl logs -f $(kubectl get po -n kube-system | egrep -o 'aws-load-balancer-controller-[A-Za-z0-9-]+') -n kube-system

Uninstall

kubectl delete -f v2_4_0_full.yaml