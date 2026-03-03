from odoo import models,fields

class Client(models.Model):
    _name = 'society.client'
    _description = 'Client'
    name=fields.Char(string='Name')
    email=fields.Char(string='Email')
    phone=fields.Char(string='Phone')
    project_ids=fields.One2many('society.project','client_id',string='Projects')



# id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
# access_society_project_user,society.project.user,model_society_project,base.group_user,1,1,1,1


#
# id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
#
# access_task_employee,task.employee,model_society_task,society_management.group_employee,1,1,1,0
# access_project_employee,project.employee,model_society_project,society_management.group_employee,1,0,0,0
# access_client_employee,client.employee,model_society_client,society_management.group_employee,1,0,0,0
#
# access_task_manager,task.manager,model_society_task,society_management.group_manager,1,1,1,1
# access_project_manager,project.manager,model_society_project,society_management.group_manager,1,1,1,1
# access_client_manager,client.manager,model_society_client,society_management.group_manager,1,1,1,1
#
# access_task_director,task.director,model_society_task,society_management.group_director,1,1,1,1
# access_project_director,project.director,model_society_project,society_management.group_director,1,1,1,1
# access_client_director,client.director,model_society_client,society_management.group_director,1,1,1,1
#

