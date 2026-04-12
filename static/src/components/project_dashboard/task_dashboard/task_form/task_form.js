/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TaskForm extends Component{
    static props = ["state", "users", "saveProject", "hideCreateForm", "editProject"];
}
TaskForm.template = "society_management.task_form";