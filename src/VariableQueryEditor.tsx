import { QueryEditor } from './QueryEditor';

export class CustomVariableQueryEditor extends QueryEditor {
  render() {
    return super.baseRender(true);
  }
}
