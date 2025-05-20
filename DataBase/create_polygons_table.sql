CREATE EXTERNAL TABLE metadata_jsonfile.polygons (
    image_id STRING,
    polygon_id INT,
    polygon_type STRING,
    annotation_json STRING
)
PARTITIONED BY (partition_0 STRING)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
STORED AS INPUTFORMAT 'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION 's3://med-image-datalake/med-image-athena-results/polygons/'
TBLPROPERTIES ('has_encrypted_data'='false');

INSERT INTO metadata_jsonfile.polygons
SELECT 
    m.id AS image_id,
    CAST(json_extract_scalar(json_parse(annotation), '$.properties.polygon_id') AS INTEGER) AS polygon_id,
    json_extract_scalar(json_parse(annotation), '$.geometry.type') AS polygon_type,
    annotation AS annotation_json,
    m.partition_0
FROM metadata_jsonfile.metadata m
CROSS JOIN UNNEST(annotations) AS t(annotation)
WHERE partition_0 = '20-05-2025'
    AND CARDINALITY(m.annotations) > 0;