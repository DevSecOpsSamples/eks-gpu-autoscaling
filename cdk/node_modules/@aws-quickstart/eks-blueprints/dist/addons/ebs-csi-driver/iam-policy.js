"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEbsDriverPolicyDocument = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
function getEbsDriverPolicyDocument(partition) {
    return aws_iam_1.PolicyDocument.fromJson({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateSnapshot",
                    "ec2:AttachVolume",
                    "ec2:DetachVolume",
                    "ec2:ModifyVolume",
                    "ec2:DescribeAvailabilityZones",
                    "ec2:DescribeInstances",
                    "ec2:DescribeSnapshots",
                    "ec2:DescribeTags",
                    "ec2:DescribeVolumes",
                    "ec2:DescribeVolumesModifications"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateTags"
                ],
                "Resource": [
                    `arn:${partition}:ec2:*:*:volume/*`,
                    `arn:${partition}:ec2:*:*:snapshot/*`
                ],
                "Condition": {
                    "StringEquals": {
                        "ec2:CreateAction": [
                            "CreateVolume",
                            "CreateSnapshot"
                        ]
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteTags"
                ],
                "Resource": [
                    `arn:${partition}:ec2:*:*:volume/*`,
                    `arn:${partition}:ec2:*:*:snapshot/*`
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "aws:RequestTag/ebs.csi.aws.com/cluster": "true"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "aws:RequestTag/CSIVolumeName": "*"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "aws:RequestTag/kubernetes.io/cluster/*": "owned"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "ec2:ResourceTag/CSIVolumeName": "*"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteVolume"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "ec2:ResourceTag/kubernetes.io/cluster/*": "owned"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteSnapshot"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "ec2:ResourceTag/CSIVolumeSnapshotName": "*"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:DeleteSnapshot"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true"
                    }
                }
            }
        ]
    });
}
exports.getEbsDriverPolicyDocument = getEbsDriverPolicyDocument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZWJzLWNzaS1kcml2ZXIvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBcUQ7QUFFckQsU0FBZ0IsMEJBQTBCLENBQUMsU0FBaUI7SUFDeEQsT0FBTyx3QkFBYyxDQUFDLFFBQVEsQ0FBQztRQUMzQixTQUFTLEVBQUUsWUFBWTtRQUN2QixXQUFXLEVBQUU7WUFDVDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLG9CQUFvQjtvQkFDcEIsa0JBQWtCO29CQUNsQixrQkFBa0I7b0JBQ2xCLGtCQUFrQjtvQkFDbEIsK0JBQStCO29CQUMvQix1QkFBdUI7b0JBQ3ZCLHVCQUF1QjtvQkFDdkIsa0JBQWtCO29CQUNsQixxQkFBcUI7b0JBQ3JCLGtDQUFrQztpQkFDckM7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7YUFDbEI7WUFDRDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLGdCQUFnQjtpQkFDbkI7Z0JBQ0QsVUFBVSxFQUFFO29CQUNSLE9BQU8sU0FBUyxtQkFBbUI7b0JBQ25DLE9BQU8sU0FBUyxxQkFBcUI7aUJBQ3hDO2dCQUNELFdBQVcsRUFBRTtvQkFDVCxjQUFjLEVBQUU7d0JBQ1osa0JBQWtCLEVBQUU7NEJBQ2hCLGNBQWM7NEJBQ2QsZ0JBQWdCO3lCQUNuQjtxQkFDSjtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTixnQkFBZ0I7aUJBQ25CO2dCQUNELFVBQVUsRUFBRTtvQkFDUixPQUFPLFNBQVMsbUJBQW1CO29CQUNuQyxPQUFPLFNBQVMscUJBQXFCO2lCQUN4QzthQUNKO1lBQ0Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTixrQkFBa0I7aUJBQ3JCO2dCQUNELFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRTtvQkFDVCxZQUFZLEVBQUU7d0JBQ1Ysd0NBQXdDLEVBQUUsTUFBTTtxQkFDbkQ7aUJBQ0o7YUFDSjtZQUNEO2dCQUNJLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixRQUFRLEVBQUU7b0JBQ04sa0JBQWtCO2lCQUNyQjtnQkFDRCxVQUFVLEVBQUUsR0FBRztnQkFDZixXQUFXLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNWLDhCQUE4QixFQUFFLEdBQUc7cUJBQ3RDO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLGtCQUFrQjtpQkFDckI7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsV0FBVyxFQUFFO29CQUNULFlBQVksRUFBRTt3QkFDVix3Q0FBd0MsRUFBRSxPQUFPO3FCQUNwRDtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTixrQkFBa0I7aUJBQ3JCO2dCQUNELFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRTtvQkFDVCxZQUFZLEVBQUU7d0JBQ1YseUNBQXlDLEVBQUUsTUFBTTtxQkFDcEQ7aUJBQ0o7YUFDSjtZQUNEO2dCQUNJLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixRQUFRLEVBQUU7b0JBQ04sa0JBQWtCO2lCQUNyQjtnQkFDRCxVQUFVLEVBQUUsR0FBRztnQkFDZixXQUFXLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNWLCtCQUErQixFQUFFLEdBQUc7cUJBQ3ZDO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNOLGtCQUFrQjtpQkFDckI7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsV0FBVyxFQUFFO29CQUNULFlBQVksRUFBRTt3QkFDVix5Q0FBeUMsRUFBRSxPQUFPO3FCQUNyRDtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTixvQkFBb0I7aUJBQ3ZCO2dCQUNELFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRTtvQkFDVCxZQUFZLEVBQUU7d0JBQ1YsdUNBQXVDLEVBQUUsR0FBRztxQkFDL0M7aUJBQ0o7YUFDSjtZQUNEO2dCQUNJLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixRQUFRLEVBQUU7b0JBQ04sb0JBQW9CO2lCQUN2QjtnQkFDRCxVQUFVLEVBQUUsR0FBRztnQkFDZixXQUFXLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNWLHlDQUF5QyxFQUFFLE1BQU07cUJBQ3BEO2lCQUNKO2FBQ0o7U0FDSjtLQUNKLENBQUMsQ0FBQztBQUNQLENBQUM7QUFsSkQsZ0VBa0pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9saWN5RG9jdW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWJzRHJpdmVyUG9saWN5RG9jdW1lbnQocGFydGl0aW9uOiBzdHJpbmcpIDogUG9saWN5RG9jdW1lbnQge1xuICAgIHJldHVybiBQb2xpY3lEb2N1bWVudC5mcm9tSnNvbih7XG4gICAgICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIixcbiAgICAgICAgXCJTdGF0ZW1lbnRcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZVNuYXBzaG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkF0dGFjaFZvbHVtZVwiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXRhY2hWb2x1bWVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6TW9kaWZ5Vm9sdW1lXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlQXZhaWxhYmlsaXR5Wm9uZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTbmFwc2hvdHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVUYWdzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlVm9sdW1lc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVZvbHVtZXNNb2RpZmljYXRpb25zXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVGFnc1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOio6Kjp2b2x1bWUvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoqOio6c25hcHNob3QvKmBcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJTdHJpbmdFcXVhbHNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNyZWF0ZVZvbHVtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ3JlYXRlU25hcHNob3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVUYWdzXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW1xuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnZvbHVtZS8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOio6KjpzbmFwc2hvdC8qYFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVm9sdW1lXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9lYnMuY3NpLmF3cy5jb20vY2x1c3RlclwiOiBcInRydWVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVWb2x1bWVcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL0NTSVZvbHVtZU5hbWVcIjogXCIqXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVm9sdW1lXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvKlwiOiBcIm93bmVkXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlVm9sdW1lXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJlYzI6UmVzb3VyY2VUYWcvZWJzLmNzaS5hd3MuY29tL2NsdXN0ZXJcIjogXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlVm9sdW1lXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJlYzI6UmVzb3VyY2VUYWcvQ1NJVm9sdW1lTmFtZVwiOiBcIipcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVWb2x1bWVcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvKlwiOiBcIm93bmVkXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlU25hcHNob3RcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9DU0lWb2x1bWVTbmFwc2hvdE5hbWVcIjogXCIqXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlU25hcHNob3RcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9lYnMuY3NpLmF3cy5jb20vY2x1c3RlclwiOiBcInRydWVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSk7XG59XG4iXX0=