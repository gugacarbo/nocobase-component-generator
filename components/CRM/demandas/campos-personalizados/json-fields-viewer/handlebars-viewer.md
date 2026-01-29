{{#if $nRecord.f_campos_preenchidos.fieldsSnapshot}}
{{#each $nRecord.f_campos_preenchidos.fieldsSnapshot}}
{{#if (eq (lookup @root.$nRecord.f_campos_preenchidos.data this.name) true)}}

### {{this.label}}:

Sim

## {{#unless @last}}

{{else}}
<br />
<br />
{{/unless}}

{{else if (eq (lookup @root.$nRecord.f_campos_preenchidos.data this.name) false)}}

### {{this.label}}:

Não

## {{#unless @last}}

{{else}}
<br />
<br />
{{/unless}}

{{else if (lookup @root.$nRecord.f_campos_preenchidos.data this.name)}}

### {{this.label}}:

{{lookup @root.$nRecord.f_campos_preenchidos.data this.name}}

## {{#unless @last}}

{{else}}
<br />
<br />
{{/unless}}
{{/if}}
{{/each}}
{{/if}}
