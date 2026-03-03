from odoo import models,fields


class Task(models.Model):
    _name='society.task'
    _description='Task'
    name=fields.Char(string='Name')
    project_id=fields.Many2one('society.project',string='Project')
    assigned_to=fields.Many2one('res.users',string='Assigned To')
    hours_spent=fields.Float(string='Hours Spent')
    cost_spent=fields.Float(string='Cost Spent')
    state=fields.Selection([
       ("todo","To Do"),
        ("pending","Pending"),
        ("done","Done"),
    ],string='State')











