"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsLoadbalancerControllerIamPolicy = void 0;
const AwsLoadbalancerControllerIamPolicy = (partition) => {
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "iam:CreateServiceLinkedRole",
                "Resource": "*",
                "Condition": {
                    "StringEquals": {
                        "iam:AWSServiceName": "elasticloadbalancing.amazonaws.com"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DescribeAccountAttributes",
                    "ec2:DescribeAddresses",
                    "ec2:DescribeAvailabilityZones",
                    "ec2:DescribeInternetGateways",
                    "ec2:DescribeVpcs",
                    "ec2:DescribeVpcPeeringConnections",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeInstances",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DescribeTags",
                    "ec2:GetCoipPoolUsage",
                    "ec2:DescribeCoipPools",
                    "elasticloadbalancing:DescribeLoadBalancers",
                    "elasticloadbalancing:DescribeLoadBalancerAttributes",
                    "elasticloadbalancing:DescribeListeners",
                    "elasticloadbalancing:DescribeListenerCertificates",
                    "elasticloadbalancing:DescribeSSLPolicies",
                    "elasticloadbalancing:DescribeRules",
                    "elasticloadbalancing:DescribeTargetGroups",
                    "elasticloadbalancing:DescribeTargetGroupAttributes",
                    "elasticloadbalancing:DescribeTargetHealth",
                    "elasticloadbalancing:DescribeTags"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "cognito-idp:DescribeUserPoolClient",
                    "acm:ListCertificates",
                    "acm:DescribeCertificate",
                    "iam:ListServerCertificates",
                    "iam:GetServerCertificate",
                    "waf-regional:GetWebACL",
                    "waf-regional:GetWebACLForResource",
                    "waf-regional:AssociateWebACL",
                    "waf-regional:DisassociateWebACL",
                    "wafv2:GetWebACL",
                    "wafv2:GetWebACLForResource",
                    "wafv2:AssociateWebACL",
                    "wafv2:DisassociateWebACL",
                    "shield:GetSubscriptionState",
                    "shield:DescribeProtection",
                    "shield:CreateProtection",
                    "shield:DeleteProtection"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:RevokeSecurityGroupIngress"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateSecurityGroup"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateTags"
                ],
                "Resource": `arn:${partition}:ec2:*:*:security-group/*`,
                "Condition": {
                    "StringEquals": {
                        "ec2:CreateAction": "CreateSecurityGroup"
                    },
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateTags",
                    "ec2:DeleteTags"
                ],
                "Resource": `arn:${partition}:ec2:*:*:security-group/*`,
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:RevokeSecurityGroupIngress",
                    "ec2:DeleteSecurityGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:CreateLoadBalancer",
                    "elasticloadbalancing:CreateTargetGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:CreateListener",
                    "elasticloadbalancing:DeleteListener",
                    "elasticloadbalancing:CreateRule",
                    "elasticloadbalancing:DeleteRule"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:AddTags",
                    "elasticloadbalancing:RemoveTags"
                ],
                "Resource": [
                    `arn:${partition}:elasticloadbalancing:*:*:targetgroup/*/*`,
                    `arn:${partition}:elasticloadbalancing:*:*:loadbalancer/net/*/*`,
                    `arn:${partition}:elasticloadbalancing:*:*:loadbalancer/app/*/*`
                ],
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:AddTags",
                    "elasticloadbalancing:RemoveTags"
                ],
                "Resource": [
                    `arn:${partition}:elasticloadbalancing:*:*:listener/net/*/*/*`,
                    `arn:${partition}:elasticloadbalancing:*:*:listener/app/*/*/*`,
                    `arn:${partition}:elasticloadbalancing:*:*:listener-rule/net/*/*/*`,
                    `arn:${partition}:elasticloadbalancing:*:*:listener-rule/app/*/*/*`
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:ModifyLoadBalancerAttributes",
                    "elasticloadbalancing:SetIpAddressType",
                    "elasticloadbalancing:SetSecurityGroups",
                    "elasticloadbalancing:SetSubnets",
                    "elasticloadbalancing:DeleteLoadBalancer",
                    "elasticloadbalancing:ModifyTargetGroup",
                    "elasticloadbalancing:ModifyTargetGroupAttributes",
                    "elasticloadbalancing:DeleteTargetGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:RegisterTargets",
                    "elasticloadbalancing:DeregisterTargets"
                ],
                "Resource": `arn:${partition}:elasticloadbalancing:*:*:targetgroup/*/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:SetWebAcl",
                    "elasticloadbalancing:ModifyListener",
                    "elasticloadbalancing:AddListenerCertificates",
                    "elasticloadbalancing:RemoveListenerCertificates",
                    "elasticloadbalancing:ModifyRule"
                ],
                "Resource": "*"
            }
        ]
    };
};
exports.AwsLoadbalancerControllerIamPolicy = AwsLoadbalancerControllerIamPolicy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvYXdzLWxvYWRiYWxhbmNlci1jb250cm9sbGVyL2lhbS1wb2xpY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sTUFBTSxrQ0FBa0MsR0FBRyxDQUFDLFNBQWlCLEVBQUUsRUFBRTtJQUNwRSxPQUFPO1FBQ0gsU0FBUyxFQUFFLFlBQVk7UUFDdkIsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRSw2QkFBNkI7Z0JBQ3ZDLFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRTtvQkFDVCxjQUFjLEVBQUU7d0JBQ1osb0JBQW9CLEVBQUUsb0NBQW9DO3FCQUM3RDtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTiwrQkFBK0I7b0JBQy9CLHVCQUF1QjtvQkFDdkIsK0JBQStCO29CQUMvQiw4QkFBOEI7b0JBQzlCLGtCQUFrQjtvQkFDbEIsbUNBQW1DO29CQUNuQyxxQkFBcUI7b0JBQ3JCLDRCQUE0QjtvQkFDNUIsdUJBQXVCO29CQUN2QiwrQkFBK0I7b0JBQy9CLGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0Qix1QkFBdUI7b0JBQ3ZCLDRDQUE0QztvQkFDNUMscURBQXFEO29CQUNyRCx3Q0FBd0M7b0JBQ3hDLG1EQUFtRDtvQkFDbkQsMENBQTBDO29CQUMxQyxvQ0FBb0M7b0JBQ3BDLDJDQUEyQztvQkFDM0Msb0RBQW9EO29CQUNwRCwyQ0FBMkM7b0JBQzNDLG1DQUFtQztpQkFDdEM7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7YUFDbEI7WUFDRDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLG9DQUFvQztvQkFDcEMsc0JBQXNCO29CQUN0Qix5QkFBeUI7b0JBQ3pCLDRCQUE0QjtvQkFDNUIsMEJBQTBC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T0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLG1EQUFtRDtvQkFDbkQsdUNBQXVDO29CQUN2Qyx3Q0FBd0M7b0JBQ3hDLGlDQUFpQztvQkFDakMseUNBQXlDO29CQUN6Qyx3Q0FBd0M7b0JBQ3hDLGtEQUFrRDtvQkFDbEQsd0NBQXdDO2lCQUMzQztnQkFDRCxVQUFVLEVBQUUsR0FBRztnQkFDZixXQUFXLEVBQUU7b0JBQ1QsTUFBTSxFQUFFO3dCQUNKLHVDQUF1QyxFQUFFLE9BQU87cUJBQ25EO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLHNDQUFzQztvQkFDdEMsd0NBQXdDO2lCQUMzQztnQkFDRCxVQUFVLEVBQUUsT0FBTyxTQUFTLDJDQUEyQzthQUMxRTtZQUNEO2dCQUNJLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixRQUFRLEVBQUU7b0JBQ04sZ0NBQWdDO29CQUNoQyxxQ0FBcUM7b0JBQ3JDLDhDQUE4QztvQkFDOUMsaURBQWlEO29CQUNqRCxpQ0FBaUM7aUJBQ3BDO2dCQUNELFVBQVUsRUFBRSxHQUFHO2FBQ2xCO1NBQ0o7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBMU5XLFFBQUEsa0NBQWtDLHNDQTBON0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgQXdzTG9hZGJhbGFuY2VyQ29udHJvbGxlcklhbVBvbGljeSA9IChwYXJ0aXRpb246IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIixcbiAgICAgICAgXCJTdGF0ZW1lbnRcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcImlhbTpDcmVhdGVTZXJ2aWNlTGlua2VkUm9sZVwiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImlhbTpBV1NTZXJ2aWNlTmFtZVwiOiBcImVsYXN0aWNsb2FkYmFsYW5jaW5nLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUFjY291bnRBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlQWRkcmVzc2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlQXZhaWxhYmlsaXR5Wm9uZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnRlcm5ldEdhdGV3YXlzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlVnBjc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVZwY1BlZXJpbmdDb25uZWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVN1Ym5ldHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTZWN1cml0eUdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUluc3RhbmNlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZU5ldHdvcmtJbnRlcmZhY2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlVGFnc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpHZXRDb2lwUG9vbFVzYWdlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlQ29pcFBvb2xzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6RGVzY3JpYmVMb2FkQmFsYW5jZXJzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6RGVzY3JpYmVMb2FkQmFsYW5jZXJBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6RGVzY3JpYmVMaXN0ZW5lcnNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZXNjcmliZUxpc3RlbmVyQ2VydGlmaWNhdGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6RGVzY3JpYmVTU0xQb2xpY2llc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkRlc2NyaWJlUnVsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZXNjcmliZVRhcmdldEdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkRlc2NyaWJlVGFyZ2V0R3JvdXBBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6RGVzY3JpYmVUYXJnZXRIZWFsdGhcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZXNjcmliZVRhZ3NcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImNvZ25pdG8taWRwOkRlc2NyaWJlVXNlclBvb2xDbGllbnRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhY206TGlzdENlcnRpZmljYXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImFjbTpEZXNjcmliZUNlcnRpZmljYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaWFtOkxpc3RTZXJ2ZXJDZXJ0aWZpY2F0ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJpYW06R2V0U2VydmVyQ2VydGlmaWNhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ3YWYtcmVnaW9uYWw6R2V0V2ViQUNMXCIsXG4gICAgICAgICAgICAgICAgICAgIFwid2FmLXJlZ2lvbmFsOkdldFdlYkFDTEZvclJlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwid2FmLXJlZ2lvbmFsOkFzc29jaWF0ZVdlYkFDTFwiLFxuICAgICAgICAgICAgICAgICAgICBcIndhZi1yZWdpb25hbDpEaXNhc3NvY2lhdGVXZWJBQ0xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ3YWZ2MjpHZXRXZWJBQ0xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ3YWZ2MjpHZXRXZWJBQ0xGb3JSZXNvdXJjZVwiLFxuICAgICAgICAgICAgICAgICAgICBcIndhZnYyOkFzc29jaWF0ZVdlYkFDTFwiLFxuICAgICAgICAgICAgICAgICAgICBcIndhZnYyOkRpc2Fzc29jaWF0ZVdlYkFDTFwiLFxuICAgICAgICAgICAgICAgICAgICBcInNoaWVsZDpHZXRTdWJzY3JpcHRpb25TdGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcInNoaWVsZDpEZXNjcmliZVByb3RlY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJzaGllbGQ6Q3JlYXRlUHJvdGVjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBcInNoaWVsZDpEZWxldGVQcm90ZWN0aW9uXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6QXV0aG9yaXplU2VjdXJpdHlHcm91cEluZ3Jlc3NcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6UmV2b2tlU2VjdXJpdHlHcm91cEluZ3Jlc3NcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVTZWN1cml0eUdyb3VwXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVGFnc1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IGBhcm46JHtwYXJ0aXRpb259OmVjMjoqOio6c2VjdXJpdHktZ3JvdXAvKmAsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVBY3Rpb25cIjogXCJDcmVhdGVTZWN1cml0eUdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJOdWxsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXdzOlJlcXVlc3RUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVUYWdzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlbGV0ZVRhZ3NcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnNlY3VyaXR5LWdyb3VwLypgLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJOdWxsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXdzOlJlcXVlc3RUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwidHJ1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpBdXRob3JpemVTZWN1cml0eUdyb3VwSW5ncmVzc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpSZXZva2VTZWN1cml0eUdyb3VwSW5ncmVzc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVTZWN1cml0eUdyb3VwXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIk51bGxcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkNyZWF0ZUxvYWRCYWxhbmNlclwiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkNyZWF0ZVRhcmdldEdyb3VwXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIk51bGxcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9lbGJ2Mi5rOHMuYXdzL2NsdXN0ZXJcIjogXCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6Q3JlYXRlTGlzdGVuZXJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZWxldGVMaXN0ZW5lclwiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkNyZWF0ZVJ1bGVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZWxldGVSdWxlXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpBZGRUYWdzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6UmVtb3ZlVGFnc1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWxhc3RpY2xvYWRiYWxhbmNpbmc6KjoqOnRhcmdldGdyb3VwLyovKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVsYXN0aWNsb2FkYmFsYW5jaW5nOio6Kjpsb2FkYmFsYW5jZXIvbmV0LyovKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVsYXN0aWNsb2FkYmFsYW5jaW5nOio6Kjpsb2FkYmFsYW5jZXIvYXBwLyovKmBcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJOdWxsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXdzOlJlcXVlc3RUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwidHJ1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkFkZFRhZ3NcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpSZW1vdmVUYWdzXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW1xuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplbGFzdGljbG9hZGJhbGFuY2luZzoqOio6bGlzdGVuZXIvbmV0LyovKi8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWxhc3RpY2xvYWRiYWxhbmNpbmc6KjoqOmxpc3RlbmVyL2FwcC8qLyovKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVsYXN0aWNsb2FkYmFsYW5jaW5nOio6KjpsaXN0ZW5lci1ydWxlL25ldC8qLyovKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVsYXN0aWNsb2FkYmFsYW5jaW5nOio6KjpsaXN0ZW5lci1ydWxlL2FwcC8qLyovKmBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6TW9kaWZ5TG9hZEJhbGFuY2VyQXR0cmlidXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOlNldElwQWRkcmVzc1R5cGVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpTZXRTZWN1cml0eUdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOlNldFN1Ym5ldHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpEZWxldGVMb2FkQmFsYW5jZXJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpNb2RpZnlUYXJnZXRHcm91cFwiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOk1vZGlmeVRhcmdldEdyb3VwQXR0cmlidXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkRlbGV0ZVRhcmdldEdyb3VwXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIk51bGxcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcvZWxidjIuazhzLmF3cy9jbHVzdGVyXCI6IFwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOlJlZ2lzdGVyVGFyZ2V0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkRlcmVnaXN0ZXJUYXJnZXRzXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogYGFybjoke3BhcnRpdGlvbn06ZWxhc3RpY2xvYWRiYWxhbmNpbmc6KjoqOnRhcmdldGdyb3VwLyovKmBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpTZXRXZWJBY2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpNb2RpZnlMaXN0ZW5lclwiLFxuICAgICAgICAgICAgICAgICAgICBcImVsYXN0aWNsb2FkYmFsYW5jaW5nOkFkZExpc3RlbmVyQ2VydGlmaWNhdGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWxhc3RpY2xvYWRiYWxhbmNpbmc6UmVtb3ZlTGlzdGVuZXJDZXJ0aWZpY2F0ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlbGFzdGljbG9hZGJhbGFuY2luZzpNb2RpZnlSdWxlXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG59OyJdfQ==