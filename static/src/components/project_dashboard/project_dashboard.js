/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ProjectForm } from "./project_form/project_form";
import { ProjectView } from "./project_view/project_view";
import { TaskDashboard } from "./task_dashboard/task_dashboard";

export class ProjectDashboard extends Component {

    static template = "society_management.project_dashboard_tag";
    static components = { ProjectForm, ProjectView, TaskDashboard };

    setup() {
    this.orm = useService("orm");
    this.action = useService("action");

    // 🔥 AJOUT ICI
    // this.showTaskForm = this.showTaskForm.bind(this);

    this.state = useState({
        projects: [],
        tasks: [],
        users: [],

        showProjectForm: false,
        showTaskForm: false,

        mode: "create",

        projectForm: {
            id: false,
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            state: "draft",
            manager_id: false,
        },

        taskForm: {
            name: "",
            description: "",
            assigned_to: false,
            priority: "1",
            state: "todo",
        },
    });

    onWillStart(async () => {
        const projects = await this.orm.searchRead(
            "society.project",
            [],
            ["id", "name", "description", "manager_id", "state", "start_date", "end_date"]
        );

        const users = await this.orm.searchRead(
            "res.users",
            [],
            ["id", "name"]
        );

        this.state.projects = projects || [];
        this.state.users = users || [];
    });
}

    // =========================
    // TASK FORM
    // =========================

//     showTaskForm() {
//     console.log("OPEN TASK WIZARD");
//
//     this.state.taskForm = {
//         name: "",
//         description: "",
//         assigned_to: false,
//         priority: "1",
//         state: "todo",
//     };
//
//     this.state.showTaskWizard = true;
// }


    showTaskForm() {
    console.log("OK FROM PROJECT DASHBOARD");

    this.state.taskForm = {
        name: "",
        description: "",
        assigned_to: false,
        priority: "1",
        state: "todo",
    };

    this.state.showTaskForm = true;
}


    closeTaskForm() {
        this.state.showTaskForm = false;
    }

    async saveTask() {
    const data = {
        name: this.state.taskForm.name,
        description: this.state.taskForm.description,
        assigned_to: this.state.taskForm.assigned_to
            ? parseInt(this.state.taskForm.assigned_to)
            : false,
        priority: this.state.taskForm.priority,
        state: this.state.taskForm.state,
        project_id: this.state.projectForm.id,
    };

    await this.orm.create("society.task", [data]);

    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", this.state.projectForm.id]],
        ["id", "name", "description", "assigned_to", "priority", "state"]
    );

    this.state.showTaskForm = false;
}
    // =========================
    // OPEN PROJECT
    // =========================
    openProject = async (ev) => {
        const id = parseInt(ev.currentTarget.dataset.id);

        const project = await this.orm.searchRead(
            "society.project",
            [["id", "=", id]],
            ["id", "name", "description", "manager_id", "start_date", "end_date", "state"]
        );

        const p = project[0];

        this.state.projectForm = {
            id: p.id,
            name: p.name || "",
            description: p.description || "",
            manager_id: p.manager_id ? p.manager_id[0] : false,
            state: p.state || "draft",
            start_date: p.start_date || "",
            end_date: p.end_date || "",
        };

        this.state.mode = "view";
        this.state.showProjectForm = true;
    };

    // =========================
    // EDIT PROJECT
    // =========================
    editProject = (ev) => {
        const id = parseInt(ev.currentTarget.dataset.id);
        const project = this.state.projects.find(p => p.id === id);

        if (!project) return;

        this.state.mode = "edit";

        this.state.projectForm = {
            id: project.id,
            name: project.name || "",
            description: project.description || "",
            manager_id: project.manager_id ? project.manager_id[0] : false,
            state: project.state || "draft",
            start_date: project.start_date || "",
            end_date: project.end_date || "",
        };

        this.state.showProjectForm = true;
    };

    // =========================
    // DELETE
    // =========================
    deleteProject = async (ev) => {
        const id = parseInt(ev.currentTarget.dataset.id);

        await this.orm.unlink("society.project", [id]);

        this.state.projects = this.state.projects.filter(p => p.id !== id);
    };

    // =========================
    // CREATE FORM
    // =========================
    showProjectForm = () => {
        this.state.mode = "create";

        this.state.projectForm = {
            id: false,
            name: "",
            description: "",
            manager_id: false,
            start_date: "",
            end_date: "",
            state: "draft",
        };

        this.state.showProjectForm = true;
    };

    // =========================
    // SAVE PROJECT
    // =========================
    saveProject = async () => {
        const data = {
            name: this.state.projectForm.name,
            description: this.state.projectForm.description,
            manager_id: this.state.projectForm.manager_id
                ? parseInt(this.state.projectForm.manager_id)
                : false,
            start_date: this.state.projectForm.start_date,
            end_date: this.state.projectForm.end_date,
            state: this.state.projectForm.state,
        };

        if (this.state.mode === "create") {
            await this.orm.create("society.project", [data]);
        } else {
            await this.orm.write(
                "society.project",
                [this.state.projectForm.id],
                data
            );
        }

        this.state.projects = await this.orm.searchRead(
            "society.project",
            [],
            ["id", "name", "description", "manager_id", "state"]
        );

        this.state.showProjectForm = false;
    };

    // =========================
    // CLOSE
    // =========================
    hideCreateForm = () => {
        this.state.showProjectForm = false;
    };
}

registry.category("actions").add("project_dashboard_tag", ProjectDashboard);