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

### Step 1: VPC

The VPC ID will be saved into the SSM parameter store to refer from other stacks.

Parameter Name : `/eks-gpu-autoscaling/vpc-id`

Use the `-c vpcId` context parameter if you want to use the existing VPC.

```bash
cdk bootstrap
cd vpc
cdk deploy
```

[vpc/lib/vpc-stack.ts](./vpc/lib/vpc-stack.ts)

### Step 2: EKS cluster and add-on with Blueprints

2 CDK stacks will be created eks-gpu-autoscaling and `eks-gpu-autoscaling/stack`, and you need to deploy the `eks-gpu-autoscaling/stack`.

```bash
cd ../eks-blueprints
cdk deploy eks-gpu-autoscaling/stack

# or define your VPC id with context parameter
cdk deploy eks-gpu-autoscaling/stack -c vpcId=<vpc-id>
```

Cluster Name: [eks-blueprints/lib/cluster-config.ts](./eks-blueprints/lib/cluster-config.ts)

[eks-blueprints/lib/cluster-stack.ts](./eks-blueprints/lib/cluster-stack.ts)

```bash
Outputs:
eks-gpu-autoscaling.Cluster = eks-gpu-autoscaling
eks-gpu-autoscaling.ClusterArn = arn:aws:eks:us-east-1:123456789012:cluster/eks-gpu-autoscaling
eks-gpu-autoscaling.ClusterCertificateAuthorityData = xxxxxxxx
eks-gpu-autoscaling.ClusterEncryptionConfigKeyArn = 
eks-gpu-autoscaling.ClusterEndpoint = https://123456789012.gr7.us-east-1.eks.amazonaws.com
eks-gpu-autoscaling.ClusterName = eks-gpu-autoscaling
eks-gpu-autoscaling.ClusterSecurityGroupId = sg-0123456789abc
eks-gpu-autoscaling.VPC = vpc-0123456789abc
eks-gpu-autoscaling.eksclusterConfigCommand515C0544 = aws eks update-kubeconfig --name eks-gpu-autoscaling --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-gpu-autoscaling-iamrole10180D71-D83FQPH1BRW3
eks-gpu-autoscaling.eksclusterGetTokenCommand3C33A2A5 = aws eks get-token --cluster-name eks-gpu-autoscaling --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-gpu-autoscaling-iamrole10180D71-D83FQPH1BRW3
```

Pods:

![K9s Pod](../screenshots/eks-bp-pod.png?raw=true)

Services:

![K9s Service](../screenshots/eks-bp-service.png?raw=true)

```bash
eksctl create iamidentitymapping --cluster <cluster-name> --arn arn:aws:iam::<account-id>:role/<role-name> --group system:masters --username admin --region us-east-1
```

### Step 3: Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml

kubectl apply -f k8s-dabboard/eks-admin-service-account.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

kubectl proxy
```

[Dashboard Login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

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
