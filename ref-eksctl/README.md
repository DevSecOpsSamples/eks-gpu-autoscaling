# EKS cluster setup using eksctl

## Step 1: Create EKS cluster and nodegroup

```bash
eksctl create cluster -f gpu-cluster.yaml --without-nodegroup
eksctl create nodegroup -f gpu-cluster-ng.yaml
```

* [gpu-cluster.yaml](./gpu-cluster.yaml)
* [gpu-cluster-ng.yaml](./gpu-cluster-ng.yaml)

It takes around 23 minutes: Cluster 13m, Manged Node Group 10m. GPU instance is not supported in some AZ such `ap-northeast-2b` Zone of Seoul region.

```bash
2022-04-29 13:34:53 [ℹ]  eksctl version 0.90.0
2022-04-29 13:34:53 [ℹ]  using region ap-northeast-2
2022-04-29 13:34:55 [ℹ]  will use version 1.20 for new nodegroup(s) based on control plane version
2022-04-29 13:34:58 [ℹ]  nodegroup "cpu-ng" will use "" [AmazonLinux2/1.20]
2022-04-29 13:34:58 [ℹ]  nodegroup "gpu-ng" will use "" [AmazonLinux2/1.20]
2022-04-29 13:34:58 [ℹ]  2 existing nodegroup(s) (cpu-ng,gpu-ng) will be excluded
2022-04-29 13:34:58 [ℹ]  1 nodegroup (gpu-ng) was included (based on the include/exclude rules)
2022-04-29 13:34:58 [ℹ]  will create a CloudFormation stack for each of 1 managed nodegroups in cluster "gpu-autoscaling-local"
2022-04-29 13:34:58 [ℹ]  
2 sequential tasks: { fix cluster compatibility, 1 task: { 1 task: { create managed nodegroup "gpu-ng" } } 
}
2022-04-29 13:34:58 [ℹ]  checking cluster stack for missing resources
2022-04-29 13:34:59 [ℹ]  cluster stack has all required resources
2022-04-29 13:34:59 [ℹ]  building managed nodegroup stack "eksctl-gpu-autoscaling-local-nodegroup-gpu-ng"
2022-04-29 13:34:59 [ℹ]  deploying stack "eksctl-gpu-autoscaling-local-nodegroup-gpu-ng"
2022-04-29 13:34:59 [ℹ]  waiting for CloudFormation stack "eksctl-gpu-autoscaling-local-nodegroup-gpu-ng"
2022-04-29 14:02:29 [ℹ]  1 task: { install Nvidia device plugin }
2022-04-29 14:02:31 [ℹ]  replaced "kube-system:DaemonSet.apps/nvidia-device-plugin-daemonset"
2022-04-29 14:02:31 [ℹ]  as you are using the EKS-Optimized Accelerated AMI with a GPU-enabled instance type, the Nvidia Kubernetes device plugin was automatically installed.
        to skip installing it, use --install-nvidia-plugin=false.
2022-04-29 14:02:31 [✔]  created 0 nodegroup(s) in cluster "gpu-autoscaling-local"
```

---

```bash
REGION=$(aws configure get default.region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CLUSTER_NAME=$(kubectl config current-context | cut -d '@' -f2 | cut -d '.' -f1)
echo "REGION: ${REGION}, ACCOUNT_ID: ${ACCOUNT_ID}, CLUSTER_NAME: ${CLUSTER_NAME}"

eksctl utils associate-iam-oidc-provider --approve --cluster ${CLUSTER_NAME}
```

Create the iamidentitymapping to access to Kubernetes cluster on AWS WebConsole:

```bash
eksctl create iamidentitymapping --cluster ${CLUSTER_NAME} --arn arn:aws:iam::${ACCOUNT_ID}:role/<role-name> --group system:masters --username admin --region ap-northeast-2
```

## Step 2: Install metrics-server

```bash
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
helm upgrade --install metrics-server metrics-server/metrics-server -n monitoring
```

## Step 3: Setup Cluster AutoScaler

https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/autoscaling.html

```bash
aws iam create-policy \
    --policy-name AmazonEKSClusterAutoscalerPolicy \
    --policy-document file://cluster-autoscaler-policy.json

eksctl create iamserviceaccount \
  --cluster=${CLUSTER_NAME} \
  --namespace=kube-system \
  --name=cluster-autoscaler \
  --attach-policy-arn=arn:aws:iam::${ACCOUNT_ID}:policy/AmazonEKSClusterAutoscalerPolicy \
  --override-existing-serviceaccounts \
  --approve
```

```bash
curl -o cluster-autoscaler-autodiscover-template.yaml https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
echo "CLUSTER_NAME: ${CLUSTER_NAME}"
sed -e "s|<YOUR CLUSTER NAME>|${CLUSTER_NAME}|g" cluster-autoscaler-autodiscover-template.yaml > cluster-autoscaler-autodiscover.yaml
kubectl apply -f cluster-autoscaler-autodiscover.yaml
kubectl annotate deployment.apps/cluster-autoscaler cluster-autoscaler.kubernetes.io/safe-to-evict="false" -n kube-system
```

```bash
# logs for cluster-autoscaler
kubectl logs -n kube-system  -f deployment/cluster-autoscaler
```

## Step 2: Install AWS Load Balancer Controller

```bash
eksctl utils associate-iam-oidc-provider \
    --region ${REGION} \
    --cluster ${CLUSTER_NAME} \
    --approve

aws eks describe-cluster --name ${CLUSTER_NAME} --query "cluster.identity.oidc.issuer" --output text

# https://oidc.eks.ap-northeast-2.amazonaws.com/id/E7027A45F2989B456FF1F485FD367E57

aws iam list-open-id-connect-providers | grep 

# "Arn": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/oidc.eks.ap-northeast-2.amazonaws.com/id/E7027A45F2989B456FF1F485FD367E57"

curl -o alb_iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://alb_iam_policy.json

eksctl create iamserviceaccount \
    --cluster ${CLUSTER_NAME} \
    --namespace kube-system \
    --name aws-load-balancer-controller \
    --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve

helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

```bash
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.5.4/cert-manager.yaml
curl -Lo v2_4_0_full-template.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.4.0/v2_4_0_full.yaml
echo "CLUSTER_NAME: ${CLUSTER_NAME}"
sed -e "s|your-cluster-name|${CLUSTER_NAME}|g" v2_4_0_full-template.yaml > v2_4_0_full.yaml
kubectl apply -f v2_4_0_full.yaml

kubectl get deployment -n kube-system aws-load-balancer-controller
```

```bash
# log 확인
kubectl logs -f $(kubectl get po -n kube-system | egrep -o 'aws-load-balancer-controller-[A-Za-z0-9-]+') -n kube-system
```

# Uninstall

```bash
kubectl delete -f v2_4_0_full.yaml
```
