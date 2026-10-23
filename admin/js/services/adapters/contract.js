/**
 * Data adapter contract. Services depend only on this shape, never on Supabase directly,
 * so the panel runs identically against Supabase or the localStorage demo store.
 * Rows use the database column names (see supabase/migrations/*_cms_schema.sql).
 *
 * @typedef {Object} Adapter
 * @property {'supabase'|'demo'} kind
 * @property {{ getUser(): Promise<{email:string}|null>, signIn(email:string, password:string): Promise<{email:string}>,
 *              signOut(): Promise<void>, isAdmin(): Promise<boolean> }} auth
 * @property {(table:string, opts?:{eq?:Object, order?:Array<[string, boolean]>}) => Promise<Object[]>} list
 * @property {(table:string, eq?:Object) => Promise<number>} count
 * @property {(table:string, key:string, value:any) => Promise<Object|null>} get
 * @property {(table:string, row:Object) => Promise<Object>} insert
 * @property {(table:string, key:string, value:any, patch:Object) => Promise<Object>} update
 * @property {(table:string, row:Object, key:string) => Promise<Object>} upsert
 * @property {(table:string, key:string, value:any) => Promise<void>} remove
 * @property {(name:string, args?:Object) => Promise<any>} rpc
 * @property {{ upload(path:string, blob:Blob, contentType:string): Promise<string>, remove(path:string): Promise<void> }} storage
 */

export const TABLES = ['projects', 'content_sections', 'settings', 'media', 'messages'];
export const BUCKET = 'media';
