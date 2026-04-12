/** @odoo-module **/

import { Component } from "@odoo/owl";
import {TaskDashboard} from "../task_dashboard/task_dashboard";

export class ProjectView extends Component {
    static template = "society_management.project_view";
    static components = { TaskDashboard };

    static props = {
        state: Object,
        hideCreateForm: Function,
        showTaskForm: Function,   // ✅ IMPORTANT
    };

}
ProjectView.template = "society_management.project_view";