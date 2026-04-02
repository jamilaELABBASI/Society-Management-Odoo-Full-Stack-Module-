/** @odoo-module **/

import { Component } from "@odoo/owl";

export class ProjectForm extends Component{
    static props = ["state", "users", "saveProject", "hideCreateForm"];
}
ProjectForm.template = "society_management.project_form";