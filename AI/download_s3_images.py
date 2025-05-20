import os
import boto3

AWS_ACCESS_KEY_ID = 'AKIASW77MLSKL2S562NM'
AWS_SECRET_ACCESS_KEY = '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'
AWS_REGION = 'ap-southeast-2'

root_folder = 'Oral_Cancer_Images'
local_root_path = os.path.join(os.getcwd(), root_folder)

if not os.path.exists(local_root_path):
    os.makedirs(local_root_path)
    print(f"Created folder: {local_root_path}")
else:
    print(f"Folder already exists: {local_root_path}")

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def download_folder_with_structure(bucket_name, prefix, local_root_path):
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            if 'Contents' not in page:
                print(f"No files found in folder: {prefix}")
                return

            for obj in page['Contents']:
                s3_file_key = obj['Key']
                if s3_file_key.endswith('/'):
                    continue

                relative_path = s3_file_key[len(prefix):]
                local_file_path = os.path.join(local_root_path, relative_path)
                local_file_dir = os.path.dirname(local_file_path)

                if not os.path.exists(local_file_dir):
                    os.makedirs(local_file_dir)
                    print(f"Created folder: {local_file_dir}")

                s3_client.download_file(bucket_name, s3_file_key, local_file_path)
                print(f"Downloaded: {local_file_path}")

    except Exception as e:
        print(f"Error downloading files: {str(e)}")

bucket_name = 'detectimagecancer'
prefix = 'oral-cancer-images/images/'

download_folder_with_structure(bucket_name, prefix, local_root_path)