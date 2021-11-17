import * as Handlebars from 'handlebars';
import {
  ParameterReflection,
  ReflectionKind,
  SignatureReflection,
} from 'typedoc';
import { memberSymbol } from '../../utils';

export default function () {
  Handlebars.registerHelper(
    'signatureTitle',
    function (this: SignatureReflection, accessor?: string, standalone = true) {
      const md: string[] = ['<span class="typedoc-signature-prefix"></span>'];

      if (standalone) {
        md.push(`${memberSymbol(this)} `);
      }

      const flags = this.parent?.flags?.filter((x) => x !== 'Const');
      if (flags?.length > 0) {
        md.push(flags.map((flag) => `\`${flag}\``).join(' ') + ' ');
      }

      if (accessor) {
        md.push(`\`${accessor}\` **${this.name}**`);
      } else if (this.name !== '__call' && this.name !== '__type') {
        md.push(`**${this.name}**`);
      }

      if (this.typeParameters) {
        md.push(
          `<${this.typeParameters
            .map((typeParameter) => `\`${typeParameter.name}\``)
            .join(', ')}\\>`,
        );
      }
      md.push(`(${getParameters(this.parameters)})`);

      if (this.type && !this.parent?.kindOf(ReflectionKind.Constructor)) {
        md.push(`: ${Handlebars.helpers.type.call(this.type, 'object')}`);
      }
      return md.join('') + (standalone ? '\n' : '');
    },
  );
}

const getParameters = (
  parameters: ParameterReflection[] = [],
  backticks = true,
) => {
  return parameters
    .map((param) => {
      const paramsmd: string[] = [];
      if (param.flags.isRest) {
        paramsmd.push('...');
      }
      const paramItem = `${param.name}${
        param.flags.isOptional || param.defaultValue ? '?' : ''
      }`;
      paramsmd.push(backticks ? `\`${paramItem}\`` : paramItem);
      return paramsmd.join('');
    })
    .join(', ');
};
