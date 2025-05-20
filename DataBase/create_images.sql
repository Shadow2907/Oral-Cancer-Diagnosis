CREATE EXTERNAL TABLE metadata_jsonfile.images (
    id STRING,
    raw_path STRING,
    processed_path STRING,
    upload_date STRING,
    label STRING,
    annotation_count INT
)
PARTITIONED BY (partition_0 STRING)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
STORED AS INPUTFORMAT 'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION 's3://med-image-datalake/med-image-athena-results/images/'
TBLPROPERTIES ('has_encrypted_data'='false');

INSERT INTO metadata_jsonfile.images
SELECT 
    id,
    raw_path,
    processed_path,
    upload_date,
    label,
    CARDINALITY(annotations) AS annotation_count,
    partition_0
FROM metadata_jsonfile.metadata
