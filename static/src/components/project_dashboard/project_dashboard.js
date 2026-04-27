/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

import { ProjectForm } from "./project_form/project_form";
import { ProjectView } from "./project_view/project_view";

class ProjectDashboard extends Component {

    static template = "society_management.project_dashboard_tag";
    static components = { ProjectForm, ProjectView  };

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            projectMode: "list",
            taskMode: null,
            users: [],
            projects: [],
            tasks:[],
            searchProject: "",
            searchTask: "",
            statusProjectFilter:"all",
            taskStatusFilter: "all",
            projectForm: {
                name: "",
                description: "",
                manager_id: false,
                start_date: "",
                end_date: "",
                state: "draft",
            },
            taskForm: {
                name: "",
                description: "",
                assigned_to: false,
                start_date: "",
                end_date: "",
                state: "todo",
                priority: "0",
            },


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


    //********************************************Projects********************************************

    showProjectForm = () => {
    this.state.projectForm = {
        id: false,
        name: "",
        description: "",
        manager_id: false,
        start_date: "",
        end_date: "",
        state: "draft",
    };

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
        ["id", "name", "description", "state","priority","start_date","end_date","assigned_to"]
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
    const searchProject = this.state.searchProject.toLowerCase();

    if (!searchProject) {
        return this.state.projects;
    }

    return this.state.projects.filter(project =>
        project.name.toLowerCase().includes(searchProject)
    );
}


    setStatusFilter = (status) => {
    this.state.statusProjectFilter = status;
        };

    get filteredProjects() {
    const searchProject = (this.state.searchProject || "").toLowerCase();
    const status = this.state.statusProjectFilter;
    const projects = this.state.projects || [];

    return projects.filter(p => {

        const matchSearch = (p.name || "").toLowerCase().includes(searchProject);

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

    //********************************************Projects********************************************

    showTaskForm = () => {
    this.state.taskForm = {
        name: "",
        description: "",
        assigned_to: false,
        start_date: "",
        end_date: "",
        state: "todo",
        priority: "0",
    };

    this.state.taskMode = "create";
};

    hideTaskForm=()=>{
        this.state.taskMode = null;
    }


    saveTask = async () => {
    const data = {
        project_id: this.state.projectForm.id,
        name: this.state.taskForm.name,
        description: this.state.taskForm.description,
        assigned_to: this.state.taskForm.assigned_to
        ? parseInt(this.state.taskForm.assigned_to)
        : false,
        start_date: this.state.taskForm.start_date,
        end_date: this.state.taskForm.end_date,
        state: this.state.taskForm.state,
        priority: this.state.taskForm.priority,
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

    // refresh
      // 🔥 recharger uniquement les tasks du projet courant
    this.state.tasks = await this.orm.searchRead(
        "society.task",
        [["project_id", "=", this.state.projectForm.id]],
        ["id", "name", "description", "state", "assigned_to", "start_date", "end_date", "priority"]
    );

    this.state.taskMode = null;
};

    editTask = (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    const task = this.state.tasks.find(p => p.id === id);

    //  remplir le formulaire
    this.state.taskForm = {
        id: task.id,
        name: task.name,
        description: task.description,
        assigned_to: task.manager_id ? task.assigned_to[0] : false,
        start_date: task.start_date || "",
        end_date: task.end_date || "",
        state: task.state,
        priority: task.priority||"0",
    };

    //  ouvrir le form en mode edit
    this.state.taskMode = "edit";
};

    deleteTask = async (ev) => {
    const id = parseInt(ev.currentTarget.dataset.id);

    await this.orm.unlink("society.task", [id]);

    // refresh tasks du projet actuel (IMPORTANT)
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
};

    get filteredTasks() {
    const search = (this.state.searchTask || "").toLowerCase();
    const status = this.state.taskStatusFilter;
    const tasks = this.state.tasks || [];

    return tasks.filter(t => {

        const matchSearch =
            t.name.toLowerCase().includes(search) ||
            (t.description || "").toLowerCase().includes(search);

        const matchStatus =
            status === "all" ? true : t.state === status;

        return matchSearch && matchStatus;
    });
}

    setTaskFilter = (status) => {
    this.state.taskStatusFilter = status;
};

    get taskStats() {
    const tasks = this.state.tasks || [];

    return tasks.reduce(
        (acc, task) => {
            acc.all++;

            if (task.state === "todo") acc.todo++;
            else if (task.state === "pending") acc.pending++;
            else if (task.state === "done") acc.done++;

            return acc;
        },
        { all: 0, todo: 0, pending: 0, done: 0 }
    );
}

}

registry.category("actions").add("project_dashboard_tag", ProjectDashboard);

export default ProjectDashboard;