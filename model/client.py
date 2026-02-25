from odoo import models,fields

class Client(models.Model):
    _name = 'client'
    _description = 'Client'
    name=fields.Char(string='Name')
    email=fields.Char(string='Email')
    phone=fields.Char(string='Phone')
    project_ids=fields.One2many('project','client_id',string='Projects')