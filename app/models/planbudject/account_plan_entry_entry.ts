import { DateTime } from 'luxon';
import { belongsTo, column, hasOne } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations';
import { EntryEntryType, OperatorType } from '../utility/Enums.js';
import AccountPlanYear from './account_plan_year.js';
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js';
import AccountPlanEntry from './account_plan_entry.js';

/**
 * Modelo que representa lançamentos do plano de contas para um ano específico.
 * @author 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default class AccountPlanEntryEntry extends CreatableAbstractModel {
  public static table = 'account_plan_entries_entry'; // Nome customizado da tabela

  @column()
  declare accountPlanYearId: number;

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>;

  @column()
  declare type: EntryEntryType;

  @column()
  declare operator: OperatorType;

  @column()
  declare postingMonth: number;

  @column.dateTime({ autoCreate: true })
  declare postingDate: DateTime;

  @column.date({
    serialize: (value: DateTime) => value?.toFormat('dd-MM-yyyy'), // Formato customizado de data
  })
  declare operationDate: DateTime;

  @column()
  declare allocation: number;
  
  @column()
  declare descriptionMoviment: string;

  @column({ columnName: 'approvedBy' })
  declare approvedBy: number;

  @column()
  declare lastFinalAllocation: number;

  @column()
  declare complianceStatus: String;

  @column()
  declare   descriptionCompliance: String;

  @column()
  declare entryId: number; // ID relacionado ao registro do plano de contas

  // Relacionamento com AccountPlanEntry
  @belongsTo(() => AccountPlanEntry, {
    foreignKey: 'entry_id', // Chave estrangeira correspondente
  })
  public entry: BelongsTo<typeof AccountPlanEntry>;

  @column()
  declare target_entrie_entry_id: number; // ID relacionado ao targetEntryEntry

  // Relacionamento hasOne com AccountPlanEntryEntry
  @hasOne(() => AccountPlanEntryEntry, {
    foreignKey: 'target_entrie_entry_id', // Chave estrangeira correta
  })
  public targetEntrieEntry: HasOne<typeof AccountPlanEntryEntry>;

}
