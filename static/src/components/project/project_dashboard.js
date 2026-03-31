/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ProjectForm } from "./form/project_form";

export class ProjectDashboard extends Component {

    static components = { ProjectForm }

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.projects = [];
        this.users = [];

        this.state = useState({
            showForm: false,
            form: {
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                state: "draft",
                manager_id: null,
            }
        });

        onWillStart(async () => {
            // Charger les projets
            this.projects = await this.orm.searchRead(
                "society.project",
                [],
                ["name", "manager_id", "state"]
            );

            // Charger les utilisateurs
            this.users = await this.orm.searchRead(
            'res.users',
            [],
            ['name'] // on récupère les users liés
             );
        });
    }





    openProject(ev) {
        const id = parseInt(ev.currentTarget.dataset.id);
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "society.project",
            res_id: id,
            views: [[false, "form"]],
            target: "current",
        });
    }

    editProject(ev) {
        const id = parseInt(ev.currentTarget.dataset.id);
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "society.project",
            res_id: id,
            views: [[false, "form"]],
            target: "current",
        });
    }

    async deleteProject(ev) {
        const id = parseInt(ev.currentTarget.dataset.id);
        try {
            await this.orm.unlink("society.project", [id]);
            // Supprimer du tableau local
            this.projects = this.projects.filter(p => p.id !== id);
        } catch (error) {
            console.error("Erreur lors de la suppression du projet:", error);
        }
    }

    async saveProject() {
        try {
            const [newProject] = await this.orm.create("society.project", [this.state.form]);
            // Ajouter le nouveau projet à la liste
            this.projects.push(newProject);

            // Réinitialiser le formulaire
            this.state.form = {
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                state: "draft",
                manager_id: null,
            };

            this.state.showForm = false;
        } catch (error) {
            console.error("Erreur lors de la création du projet:", error);
        }
    }

    showCreateForm() {
        this.state.showForm = true;
    }

    hideCreateForm() {
        this.state.showForm = false;
    }

}

ProjectDashboard.template = "society_management.project_dashboard_tag";
registry.category("actions").add("project_dashboard_tag", ProjectDashboard);