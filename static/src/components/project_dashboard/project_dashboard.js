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
        taskMode: "create",
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
            id: false,
            name: "",
            description: "",
            assigned_to: false,
            priority: "0",
            state: "todo",
            start_date: "",
            end_date: "",
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

        const tasks = await this.orm.searchRead(
        "society.task",
        [],
        ["id", "name", "description", "assigned_to", "priority", "state", "project_id", "start_date", "end_date"]
    );


        this.state.projects = projects || [];
        this.state.users = users || [];
        this.state.tasks = tasks || [];

    });
}


    // =============    PROJECT  ============

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
            manager: p.manager_id ? {id:p.manager_id[0],name:p.manager_id[1]}:null,
            state: p.state || "draft",
            start_date: p.start_date || "",
            end_date: p.end_date || "",
        };

      // ✅ IMPORTANT : charger les tasks du projet
        this.state.tasks = await this.orm.searchRead(
            "society.task",
            [["project_id", "=", id]],
            ["id", "name", "description", "assigned_to", "priority", "state", "start_date", "end_date"]
        );

        this.state.mode = "view";
        this.state.showProjectForm = true;
    };

    hideCreateForm = () => {
        this.state.showProjectForm = false;
    };

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

    deleteProject = async (ev) => {
        const id = parseInt(ev.currentTarget.dataset.id);

        await this.orm.unlink("society.project", [id]);

        this.state.projects = this.state.projects.filter(p => p.id !== id);
    };

    // =============    PROJECT  ============

    showTaskForm() {
    this.state.taskMode = "create";

    this.state.taskForm = {
        id: false,
        name: "",
        description: "",
        assigned_to: false,
        priority: "1",
        state: "todo",
        start_date: "",
        end_date: "",
    };

    this.state.showTaskForm = true;
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
        start_date: this.state.taskForm.start_date,
        end_date: this.state.taskForm.end_date,
        project_id: this.state.projectForm.id,
    };

    if (this.state.taskMode === "create") {
        await this.orm.create("society.task", [data]);
    } else {
        await this.orm.write(
            "society.task",
            [this.state.taskForm.id],
            data
        );
    }

    // refresh tasks
    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", this.state.projectForm.id]],
        ["id", "name", "description", "assigned_to", "priority", "state"]
    );

    this.state.showTaskForm = false;
}

    closeTaskForm() {
        this.state.showTaskForm = false;
    }

    deleteTask = async (ev) => {

        const id = parseInt(ev.currentTarget.dataset.id);

        await this.orm.unlink("society.task", [id]);

        this.state.tasks = this.state.tasks.filter(p => p.id !== id);

};

    editTask = (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    const task = this.state.tasks.find(t => t.id === id);

    if (!task) {
        console.log("Task not found", id);
        return;
    }

    this.state.taskMode = "edit";

    this.state.taskForm = {
        id: task.id,
        name: task.name || "",
        description: task.description || "",
        assigned_to: task.assigned_to ? task.assigned_to[0] : false,
        priority: task.priority || "1",
        state: task.state || "todo",
        start_date: task.start_date || "",
        end_date: task.end_date || "",
    };

    this.state.showTaskForm = true;
};



}

registry.category("actions").add("project_dashboard_tag", ProjectDashboard);