/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ProjectForm } from "./project_form/project_form";
import { ProjectView } from "./project_view/project_view";

export class ProjectDashboard extends Component {

    static components = { ProjectForm, ProjectView }

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.projects = [];
        this.users = [];

        this.state = useState({
            projects:[],
            showForm: false,
            mode:"create",
            form: {
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                state: "draft",
                manager_id: null,
            },
        });

        onWillStart(async () => {
            // Charger les projets
            this.state.projects = await this.orm.searchRead(
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


async openProject(ev) {
    const id = parseInt(ev.currentTarget.dataset.id);

    const project = await this.orm.searchRead(
        "society.project",
        [["id", "=", id]],
        ["id", "name", "description", "manager_id", "start_date", "end_date", "state"]
    );

    this.state.form = {
        ...project[0],
        manager_name: project[0].manager_id?.[1] || ""
    };

    // charger les tâches liées
    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", id]],
        ["id", "name", "state"]
    );

    this.state.mode = "view";
    this.state.showForm = true;
}


    async editProject(ev) {
    const id = parseInt(ev.currentTarget.dataset.id);

    // Récupérer les données du projet via RPC
    const project = await this.orm.call("society.project", "read", [[id], [
        "name", "description", "manager_id", "start_date", "end_date", "state"
    ]]);

    // Mettre à jour le state pour passer en mode édition
    this.state.form = {
        ...project[0],
        manager_name: project[0].manager_id[1], // si tu veux afficher le nom
    };
    this.state.mode = "edit";
}


    showCreateForm() {
    this.state.form = {
        name: "",
        description: "",
        manager_id: "",
        start_date: "",
        end_date: "",
        state: "draft"
    };

    this.state.mode = "create";
    this.state.showForm = true;
}

    async loadProjects() {
    this.state.projects = await this.orm.searchRead(
        "society.project",
        [],
        ["name", "manager_id", "state"]
    );
}

   async saveProject() {
    const data = {
        ...this.state.form,
        manager_id: this.state.form.manager_id
            ? parseInt(this.state.form.manager_id)
            : false,
    };

    if (this.state.mode === "create") {
        await this.orm.create("society.project", [data]);
    } else {
        await this.orm.write("society.project", [data.id], data);
    }

    // ✅ TRÈS IMPORTANT → recharger les projets
    this.state.projects = await this.orm.searchRead(
        "society.project",
        [],
        ["name", "manager_id", "state"]
    );

    this.state.showForm = false;
}

    async openProject(ev) {
    const id = parseInt(ev.currentTarget.dataset.id);

    const project = await this.orm.searchRead(
        "society.project",
        [["id", "=", id]],
        ["id", "name", "description", "manager_id", "start_date", "end_date", "state"]
    );

    this.state.form = {
        ...project[0],
        manager_name: project[0].manager_id?.[1] || ""
    };

    // charger les tâches liées
    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", id]],
        ["id", "name", "state"]
    );

    this.state.mode = "view";
    this.state.showForm = true;
}

    async editProject(ev) {
    const id = parseInt(ev.currentTarget.dataset.id);

    const project = await this.orm.searchRead(
        "society.project",
        [["id", "=", id]],
        ["id", "name", "description", "manager_id", "start_date", "end_date", "state"]
    );

    this.state.form = {
        ...project[0],
        manager_name: project[0].manager_id?.[1] || ""
    };

    this.state.mode = "edit";
    this.state.showForm = true;
}

    async deleteProject(ev) {
        const id = parseInt(ev.currentTarget.dataset.id);
        try {
            await this.orm.unlink("society.project", [id]);
            // Supprimer du tableau local
            this.state.projects = this.state.projects.filter(p => p.id !== id);
        } catch (error) {
            console.error("Erreur lors de la suppression du projet:", error);
        }
    }



    hideCreateForm() {
        this.state.showForm = false;
    }

}

ProjectDashboard.template = "society_management.project_dashboard_tag";
registry.category("actions").add("project_dashboard_tag", ProjectDashboard);