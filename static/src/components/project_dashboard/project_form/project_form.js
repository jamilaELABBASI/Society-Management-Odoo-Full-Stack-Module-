import { Component } from "@odoo/owl";

export class ProjectForm extends Component {

    static props = {
        state: Object,
        users: Array,
        saveProject: Function,
        hideCreateForm: Function,
        editProject: { type: Function, optional: true },
    };
}

// 🔥 IMPORTANT LINE (TON BUG)
ProjectForm.template = "society_management.project_form";