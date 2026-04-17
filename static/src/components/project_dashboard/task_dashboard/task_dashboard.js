/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TaskDashboard extends Component {
    static template = "society_management.task_dashboard";

    static props = {
        tasks: Array,
        state: Object,              // ✅ IMPORTANT
        showTaskForm: Function,
        deleteTask: Function,
        editTask: Function,
    };


}