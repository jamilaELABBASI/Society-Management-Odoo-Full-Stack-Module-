/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

import { ProjectForm } from "./project_form/project_form";
import {ProjectView} from "./project_view/project_view";

class ProjectDashboard extends Component {

    static template = "society_management.project_dashboard_tag";
    static components = { ProjectForm, ProjectView  };

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            projectMode: "list",
            users: [],
            projects: [],
            tasks:[],
            search: "",
            statusFilter:"all",
            projectForm: {
                name: "",
                description: "",
                manager_id: false,
                start_date: "",
                end_date: "",
                state: "draft",
            }
        });

        onWillStart(async () => {
            this.state.users = await this.orm.searchRead(
                "res.users",
                [],
                ["id", "name"]
            );

            this.state.projects=await this.orm.searchRead(
                "society.project",
                [],
                ["id","name","description","state","start_date","end_date"]
            )
        });
    }


    ////////////////////////////Projects //////////////////////

    showProjectForm = () => {
        this.state.projectMode = "create";
    };

    hideProjectForm = () => {
        this.state.projectMode = "list";
    };

    openProject = async (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    const project = this.state.projects.find(p => p.id === id);

    this.state.projectForm = { ...project };

    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", id]],
        ["id", "name", "description", "state","priority","start_date","end_date"]
    );

    this.state.projectMode = "view";
};

    saveProject = async () => {
    const data = {
        name: this.state.projectForm.name,
        description: this.state.projectForm.description,
        manager_id: this.state.projectForm.manager_id || false,
        start_date: this.state.projectForm.start_date,
        end_date: this.state.projectForm.end_date,
        state: this.state.projectForm.state,
    };

    if (this.state.projectMode === "create") {
        await this.orm.create("society.project", [data]);
    } else {
        await this.orm.write(
            "society.project",
            [this.state.projectForm.id],
            data
        );
    }

    // refresh
    this.state.projects = await this.orm.searchRead(
        "society.project",
        [],
        ["id", "name", "description", "state", "manager_id", "start_date", "end_date"]
    );

    this.state.projectMode = "list";
};

    editProject = (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    // 🔍 récupérer le projet depuis state
    const project = this.state.projects.find(p => p.id === id);

    // 🧠 remplir le formulaire
    this.state.projectForm = {
        id: project.id,
        name: project.name,
        description: project.description,
        manager_id: project.manager_id ? project.manager_id[0] : false,
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        state: project.state,
    };

    // 🔁 ouvrir le form en mode edit
    this.state.projectMode = "edit";
};

    deleteProject = async (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    await this.orm.unlink("society.project", [id]);

    // 🔄 mettre à jour la liste sans recharger la page
    this.state.projects = this.state.projects.filter(p => p.id !== id);
};

    get filteredProjects() {
    const search = this.state.search.toLowerCase();

    if (!search) {
        return this.state.projects;
    }

    return this.state.projects.filter(project =>
        project.name.toLowerCase().includes(search)
    );
}


    setStatusFilter = (status) => {
    this.state.statusFilter = status;
        };

    get filteredProjects() {
    const search = (this.state.search || "").toLowerCase();
    const status = this.state.statusFilter;
    const projects = this.state.projects || [];

    return projects.filter(p => {

        const matchSearch = (p.name || "").toLowerCase().includes(search);

        const matchStatus =
            status === "all" ? true : p.state === status;

        return matchSearch && matchStatus;
    });
}


    getProjectStats() {
    return this.state.projects.reduce(
        (acc, project) => {
            acc.all++;

            if (project.state === "draft") acc.draft++;
            else if (project.state === "progress") acc.progress++;
            else if (project.state === "done") acc.done++;
            else if (project.state === "cancel") acc.cancel++;

            return acc;
        },
        { all: 0, draft: 0, progress: 0, done: 0, cancel: 0 }
    );
}

    get projectStats() {
    return this.getProjectStats();
}




}

registry.category("actions").add("project_dashboard_tag", ProjectDashboard);

export default ProjectDashboard;