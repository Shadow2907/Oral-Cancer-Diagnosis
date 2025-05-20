CREATE EXTERNAL TABLE metadata_jsonfile.feature_matrices (
    id STRING,
    label STRING,
    feature_matrix ARRAY<DOUBLE>
)
PARTITIONED BY (partition_0 STRING)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
STORED AS INPUTFORMAT 'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION 's3://med-image-datalake/med-image-athena-results/feature_matrices/'
TBLPROPERTIES ('has_encrypted_data'='false');

INSERT INTO metadata_jsonfile.feature_matrices
SELECT 
    id,
    label,
    feature_matrix,
    partition_0
FROM metadata_jsonfile.metadata1;