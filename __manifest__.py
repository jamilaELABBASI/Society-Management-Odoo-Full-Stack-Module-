{
    'name': 'Society Management',
    'author': 'Jamila EL ABBASI',
    'version': '1.0',
    'category': 'society management',
    'depends': ['base'],
    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'security/groups_rules.xml',
        'views/project/project_views.xml',
        'views/project/project_menu.xml',
        'views/project/project_kanban.xml',
        'views/task/task_views.xml',
    ],
    'application': True,
    'license': 'LGPL-3',
}