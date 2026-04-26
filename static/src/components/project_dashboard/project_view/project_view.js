/** @odoo-module **/

import { Component } from "@odoo/owl";

export class ProjectView extends Component {
    static template = "society_management.project_view";


    static props={
        state:Object,
        tasks:Array,
    }

}