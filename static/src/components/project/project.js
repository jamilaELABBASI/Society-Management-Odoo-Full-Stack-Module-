/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ProjectForm } from "./form/project_form";

export class ProjectDashboard extends Component {

static components={ ProjectForm}

    setup(){

        this.orm = useService("orm");
        this.projects=[];
        this.action=useService("action")

        onWillStart(async () => {
        // Récupérer les projets
        this.projects = await this.orm.searchRead(
        "society.project",
        [],
        ["name", "manager_id", "state"] );
    });
        this.state = useState({
            showForm: false,
            form: {
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                state: "draft",
            }
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

    await this.orm.unlink("society.project", [id]);

    // refresh simple
    this.projects = this.projects.filter(p => p.id !== id);
}


async saveProject(){

    await this.orm.create("society.project",[this.state.form]);

    this.state.form={
        name:"",
        description:"",
        start_date:"",
        end_date:"",
        state:"draft",
    };

    this.state.showForm=false;

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
