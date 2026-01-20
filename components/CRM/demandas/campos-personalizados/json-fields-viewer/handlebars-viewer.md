{{#if $nRecord.f_campos_preenchidos.fieldsSnapshot}}
{{#each $nRecord.f_campos_preenchidos.fieldsSnapshot}}

### {{this.label}}:

{{#if (eq (lookup @root.$nRecord.f_campos_preenchidos.data this.name) true)}}
Sim
{{else if (eq (lookup @root.$nRecord.f_campos_preenchidos.data this.name) false)}}
Não
{{else if (lookup @root.$nRecord.f_campos_preenchidos.data this.name)}}
{{lookup @root.$nRecord.f_campos_preenchidos.data this.name}}
{{else}}
Não respondido
{{/if}}
{{#unless @last}}

---

{{else}}
</br>
</br>
{{/unless}}

{{/each}}
{{/if}}
