{
    'name': 'Society Management',
    'author': 'Jamila EL ABBASI',
    'version': '1.0',
    'category': 'society management',
    'depends': ['base','mail'],
    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'security/groups_rules.xml',

        'views/project/project_views.xml',
        'views/project/project_kanban.xml',
        'views/task/task_kanban.xml',
        'views/task/task_views.xml',
        'views/project/project_menu.xml',

    ],

    'assets':{
        'web.assets_backend':[
            'society_management/static/src/css/task_kanban.css',
            'society_management/static/src/css/project_views.css',
        ],
    },
    'application': True,
    'license': 'LGPL-3',
}