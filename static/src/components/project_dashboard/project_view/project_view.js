/** @odoo-module **/

import { Component } from "@odoo/owl";
import { TaskDashboard } from "../task_dashboard/task_dashboard";
import { TaskForm } from "../task_dashboard/task_form/task_form";

export class ProjectView extends Component {
    static template = "society_management.project_view";
    static components = { TaskDashboard, TaskForm };

    static props = {
    state: Object,
    hideCreateForm: Function,
    showTaskForm: Function,
    saveTask: Function,
    closeTaskForm: Function,
};

}
ProjectView.template = "society_management.project_view";