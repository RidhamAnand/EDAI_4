from marshmallow import Schema, fields

class UserRetentionSchema(Schema):
    device_id = fields.String(required=True)
    rssi_values = fields.List(fields.Integer(), required=True)
    user_retention = fields.Integer(required=True)
    in_time = fields.Integer(required=True)  # Expecting Epoch time
    out_time = fields.Integer(required=True)  # Expecting Epoch time
    average_distance = fields.Float(required=True)