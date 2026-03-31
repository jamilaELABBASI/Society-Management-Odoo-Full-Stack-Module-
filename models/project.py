from datetime import date
from email.policy import default

from odoo import fields, models, api
from odoo.exceptions import ValidationError, UserError
from odoo.orm.decorators import depends


class Project(models.Model):
    _name = 'society.project'
    _description = 'Project'
    name = fields.Char(string='Name')
    description = fields.Text(string="Description")
    client_id=fields.Many2one('society.client',string='Client ID')
    # manager_id=fields.Many2one('res.users',string='Project Manager',manager_id=fields.Many2one('res.users',string='Project Manager'),domain="[('groups_id','in',[ref('society_management.group_manager')])]")
    manager_group_id = fields.Many2one(
        'res.groups',
        default=lambda self: self.env.ref('society_management.group_manager'),
        store=False
    )

    manager_id = fields.Many2one(
        'res.users',
        string='Manager',
        # domain="[('groups_id','in',[manager_group_id])]"
    )
    start_date=fields.Date(string='Start Date')
    end_date=fields.Date(string='End Date')
    state=fields.Selection([
        ("draft","Draft"),
        ("progress","In Progress"),
        ("done","Done"),
        ("cancel","Cancelled"),
    ],string='State',default="draft")
    task_ids=fields.One2many('society.task','project_id',string='Tasks')
    task_count=fields.Integer(compute="_compute_task_count")
    total_hours=fields.Float(string='Total Hours',compute='_compute_total_hours')
    total_cost=fields.Float(string='Total Cost',compute='_compute_total_cost')
    priority=fields.Selection([
        ('0','Low'),
        ('1','Medium'),
        ('2','High'),
        ('3','Urgent'),
    ],default='1')
    bar_todo=fields.Float(string="Draft (%)",compute="_compute_progress")
    bar_pending=fields.Float(string="Progress (%)",compute="_compute_progress")
    bar_done=fields.Float(string="Done (%)",compute="_compute_progress")
    is_late=fields.Boolean(compute="_compute_is_late")


    """
    # compute         Indique que le champ est calculé
    # _compute_total  Méthode qui fait le calcul
    # @api.depends()  Indique les champs qui déclenchent le recalcul
    # 🔹 4️⃣ Important ⚠️
    #
    # Par défaut, un champ compute :
    #
    # ❌ n’est pas stocké en base de données
    #
    # ❌ n’est pas modifiable manuellement
    #
    # Si je veux le stocker : je dois utiliser store=True


    """
    """
    # au lieu dutiliser ca  on peut utiliser une version propre niveau avance 
    @api.depends('task_ids.hours_spent')
    def _compute_total_hours(self):
        for projet in self:
            total=0
            for task in projet.task_ids:
                total+=task.hours_spent
            projet.total_hours=total
    """
    @api.depends('task_ids.hours_spent')
    def _compute_total_hours(self):
        for projet in self:
            projet.total_hours=sum(projet.task_ids.mapped('hours_spent'))

    @api.depends('task_ids.cost_spent')
    def _compute_total_cost(self):
        for projet in self:
            projet.total_cost=sum(projet.task_ids.mapped('cost_spent'))

            """ 
            # que Signifie : mapped
            # Prends toutes les tâches du projet
            # Récupère leurs heures
            # Fais la somme
            # Mets le résultat dans total_hours


            # 🔵 1️⃣ compute (champ calculé automatiquement)
            #
            # 👉 Sert à calculer une valeur automatiquement
            #
            # total = fields.Float(compute="_compute_total")
            #
            # @api.depends('price', 'quantity')
            # def _compute_total(self):
            #     for record in self:
            #         record.total = record.price * record.quantity
            # ✅ Quand utiliser ?
            #
            # Calcul
            # Compteur
            # Somme
            # Statut dynamique

            # ⚠ Important
            #
            # Par défaut :
            # non stocké
            # non modifiable
            # Pour le stocker :
            #
            # total = fields.Float(compute="_compute_total", store=True)
            # 🔵 2️⃣ inverse (rendre un champ compute modifiable)
            #
            # 👉 Permet de modifier un champ calculé manuellement
            #
            # Exemple :
            #
            # total = fields.Float(
            #     compute="_compute_total",
            #     inverse="_inverse_total"
            # )
            #
            # def _inverse_total(self):
            #     for record in self:
            #         record.price = record.total / record.quantity if record.quantity else 0
            # 💡 Pourquoi ?
            #
            # Normalement un champ compute est readonly.
            # Avec inverse, tu peux écrire dedans.
            #
            # 👉 Utilisé quand :
            #
            # Tu veux garder logique automatique
            #
            # MAIS autoriser modification manuelle
            #
            # 🔵 3️⃣ related (champ lié à un autre champ)
            #
            # 👉 Sert à afficher un champ d’un autre modèle
            #
            # Exemple :
            #
            # manager_email = fields.Char(
            #     related="manager_id.email",
            #     store=True
            # )
            #
            # Si :
            #
            # manager_id = fields.Many2one('res.users')
            #
            # 👉 manager_email récupère automatiquement res.users.email
            #
            # ✅ Quand utiliser ?
            #
            # Afficher info d’un Many2one
            #
            # Éviter duplication de données
            #
            # 🔵 4️⃣ onchange (changement en interface seulement)
            #
            # 👉 Sert à modifier des valeurs dans le formulaire uniquement
            #
            # @api.onchange('price')
            # def _onchange_price(self):
            #     if self.price < 0:
            #         self.price = 0
            # ⚠ Très important
            #
            # Ne sauvegarde rien en base automatiquement
            #
            # Fonctionne seulement dans la vue Form
            #
            # Ne fonctionne pas via API
            """

    @api.constrains('start_date','end_date')
    def _check_date(self):
        for record in self:
            if record.start_date and record.end_date:
                if record.end_date < record.start_date:
                    raise ValidationError("La date de fin doit etre apres la date de debut")


    def create(self,vals):
        if not vals.get('state'):
            vals['state'] = 'draft'
        return super().create(vals)


    def write(self,vals):
        for record in self:
            if record.state == 'done':
                raise UserError("Impossible de modifier le projet est termine")
        return super().write(vals)

    """
    # version plus profesionnelle
    def write(self,vals):
        if any(record.state == 'done' for record in self ):
            raise UserError("Impossible de modifier le projet est termine")
        return super().write(vals)
    """

    def unlink(self):
        for record in self:
            if record.state == 'cancel':
                raise UserError("Impossible de supprimer le projet est cancelled.")
        return super().unlink()

    def _compute_task_count(self):
        for rec in self:
            rec.task_count=len(self.task_ids)


    @depends('task_ids','task_ids.state')
    def _compute_progress(self):
        for project in self:
            if project.task_ids:
                total = len(project.task_ids)

                todo = len(project.task_ids.filtered(lambda t: t.state == 'todo'))
                pending = len(project.task_ids.filtered(lambda t: t.state == 'pending'))
                done = len(project.task_ids.filtered(lambda t: t.state == 'done'))

                project.bar_todo = (todo / total) * 100
                project.bar_pending = (pending / total) * 100
                project.bar_done = (done / total) * 100
            else:
                project.bar_done=0
                project.bar_todo=0
                project.bar_pending=0


    @api.depends('end_date','state')
    def _compute_is_late(self):
        today=date.today()
        for rec in self:
            if rec.end_date and rec.state != 'done' and rec.end_date<today:
                rec.is_late=True
            else:
                rec.is_late=False

    def action_open_form(self):
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'society.project',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'current',
        }

    def action_view_tasks(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Tasks',
            'res_model': 'society.task',
            'view_mode': 'list,form',
            'domain': [('project_id', '=', self.id)],
        }
    """
        @api.depends('state')
        def _compute_progress(self):
            for rec in self:
                if rec.state == 'draft':
                    rec.progress=0
                elif rec.state == 'progress':
                    rec.progress=50
                elif rec.state == 'done':
                    rec.progress=100
                else:
                    rec.progress=0
    """

