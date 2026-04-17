/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TaskForm extends Component {
    static template = "society_management.task_form";

    static props = {
        state: Object,
        saveTask: Function,
        closeTaskForm: Function,
        editTask: Function,
    };
}