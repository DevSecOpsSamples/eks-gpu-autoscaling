# GPU cluster with EKS Blueprints

## Prerequisites

```bash
npm install -g aws-cdk@2.20.0

# install packages in the <repository-root>/cdk folder
npm install

export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

Use the `cdk` command-line toolkit to interact with your project:

 * `cdk deploy`: deploys your app into an AWS account
 * `cdk synth`: synthesizes an AWS CloudFormation template for your app
 * `cdk diff`: compares your app with the deployed stack
 * `cdk watch`: deployment every time a file change is detected

## CDK Stack Time Taken

| Stack                         | Time    |
|-------------------------------|---------|
| VPC                           | 3m      |
| EKS cluster                   | 21m  (38 Stacks)   |
| Total                         | 24m     |

## Deploy

1. VPC
2. EKS cluster and add-on with Blueprints
3. Label for GPU node group
4. Install NVIDIA Device Plugin
5. Kubernetes Dashboard

### Step 1: VPC

The VPC ID will be saved into the SSM Parameter Store to refer from other stacks.

Parameter Name : `/eks-gpu-autoscaling/vpc-id`

Use the `-c vpcId` context parameter if you want to use the existing VPC.

```bash
cdk bootstrap
cd vpc
cdk deploy
```

[vpc/lib/vpc-stack.ts](./vpc/lib/vpc-stack.ts)

### Step 2: EKS cluster and add-on with Blueprints

| Instance Type | GPU | vCPU | RAM(GiB) |
|---------------|-----|------|----------|
| g4dn.xlarge   | 1   | 4    | 16       |
| g4dn.2xlarge  | 1   | 8    | 32       |
| g4dn.4xlarge  | 1   | 16   | 64       |
| g4dn.8xlarge  | 1   | 32   | 128      |
| g4dn.16xlarge | 1   | 64   | 256      |
| p2.xlarge     | 1   | 4    | 61       |
| p2.8xlarge    | 8   | 32   | 488      |
| p2.16xlarge   | 16  | 64   | 732      |

2 CDK stacks will be created gpu-autoscaling-local and `gpu-autoscaling-local/gpu-autoscaling-local`, and you need to deploy the `gpu-autoscaling-local/gpu-autoscaling-local`.

```bash
cd ../eks-blueprints
cdk deploy gpu-autoscaling-local/gpu-autoscaling-local

# or define your VPC id with context parameter
cdk deploy gpu-autoscaling-local/gpu-autoscaling-local -c vpcId=<vpc-id>
```

Cluster Name: [eks-blueprints/lib/cluster-config.ts](./eks-blueprints/lib/cluster-config.ts)

[eks-blueprints/lib/cluster-stack.ts](./eks-blueprints/lib/cluster-stack.ts)

```bash
Outputs:
eks-gpu-autoscaling-local.Cluster = eks-gpu-autoscaling-local
eks-gpu-autoscaling-local.ClusterArn = arn:aws:eks:us-east-1:123456789012:cluster/eks-gpu-autoscaling-local
eks-gpu-autoscaling-local.ClusterCertificateAuthorityData = xxxxxxxx
eks-gpu-autoscaling-local.ClusterEncryptionConfigKeyArn = 
eks-gpu-autoscaling-local.ClusterEndpoint = https://123456789012.gr7.us-east-1.eks.amazonaws.com
eks-gpu-autoscaling-local.ClusterName = eks-gpu-autoscaling-local
eks-gpu-autoscaling-local.ClusterSecurityGroupId = sg-0123456789abc
eks-gpu-autoscaling-local.VPC = vpc-0123456789abc
eks-gpu-autoscaling-local.eksclusterConfigCommand515C0544 = aws eks update-kubeconfig --name eks-gpu-autoscaling-local --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-gpu-autoscaling-local-iamrole10180D71-D83FQPH1BRW3
eks-gpu-autoscaling-local.eksclusterGetTokenCommand3C33A2A5 = aws eks get-token --cluster-name eks-gpu-autoscaling-local --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-gpu-autoscaling-local-iamrole10180D71-D83FQPH1BRW3
```

```bash
# [optional] create iamidentitymapping to access to K8s cluster on AWS webconsole
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get default.region)
eksctl create iamidentitymapping --cluster <cluster-name> --arn arn:aws:iam::${ACCOUNT_ID}:role/<role-name> --group system:masters --username admin --region ${REGION}
```

### Step 3: Label for GPU node group

Update the `accelerator=nvidia-gpu` label for GPU node group:

```bash
aws eks update-nodegroup-config --cluster-name gpu-autoscaling-local --nodegroup-name gpu-ng --labels addOrUpdateLabels={accelerator=nvidia-gpu}
```

```json
{
    "update": {
        "id": "75880a48-d608-3cd8-9cbe-f1ee10bb4cd4",
        "status": "InProgress",
        "type": "ConfigUpdate",
        "params": [
            {
                "type": "LabelsToAdd",
                "value": "{\"accelerator\":\"nvidia-gpu\"}"
            }
        ],
        "createdAt": "2022-04-26T12:16:05.910000+09:00",
        "errors": []
    }
}
```

### Step 4: Install NVIDIA Device Plugin

https://github.com/NVIDIA/k8s-device-plugin

Enable GPU support by deploying the following Daemonset:

```bash
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.11.0/nvidia-device-plugin.yml
```

### Step 5: Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml

kubectl apply -f k8s-dabboard/eks-admin-service-account.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
```

kubectl proxy for [Dashboard Login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login):

```bash
kubectl proxy
```

### Pods in Cluster

Pods:

![K9s Pod](../screenshots/eks-bp-pod.png?raw=true)

Services:

![K9s Service](../screenshots/eks-bp-service.png?raw=true)

## Destroy

```bash
cd cdk/vpc
cdk destroy 

cd ../eks-blueprints
cdk destroy
```

## Reference

 * https://github.com/aws-quickstart/cdk-eks-blueprints

 * https://aws-quickstart.github.io/cdk-eks-blueprints
