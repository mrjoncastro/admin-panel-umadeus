import { queryWithRLS } from '../database/connection'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export class CategoryRepository {
  async findAll(tenantId: string): Promise<Category[]> {
    return await queryWithRLS(tenantId, 
      'SELECT * FROM categorias ORDER BY nome ASC'
    )
  }

  async findById(tenantId: string, id: string): Promise<Category | null> {
    const categories = await queryWithRLS(tenantId, 
      'SELECT * FROM categorias WHERE id = $1', 
      [id]
    )
    return categories.length > 0 ? categories[0] : null
  }

  async findBySlug(tenantId: string, slug: string): Promise<Category | null> {
    const categories = await queryWithRLS(tenantId, 
      'SELECT * FROM categorias WHERE slug = $1', 
      [slug]
    )
    return categories.length > 0 ? categories[0] : null
  }

  async create(tenantId: string, categoryData: CreateCategoryRequest): Promise<Category> {
    const { nome, slug } = categoryData

    const sql = `
      INSERT INTO categorias (nome, slug, cliente)
      VALUES ($1, $2, $3)
      RETURNING *
    `

    const categories = await queryWithRLS(tenantId, sql, [nome, slug, tenantId])
    return categories[0]
  }

  async update(tenantId: string, id: string, categoryData: UpdateCategoryRequest): Promise<Category | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    // Construir dinamicamente os campos a serem atualizados
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) {
      return await this.findById(tenantId, id)
    }

    values.push(id)
    const sql = `
      UPDATE categorias 
      SET ${fields.join(', ')}, updated = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const categories = await queryWithRLS(tenantId, sql, values)
    return categories.length > 0 ? categories[0] : null
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    // Verificar se há produtos usando esta categoria
    const products = await queryWithRLS(tenantId, 
      'SELECT COUNT(*) as count FROM produtos WHERE categoria = $1', 
      [id]
    )
    
    if (parseInt(products[0].count) > 0) {
      throw new Error('Não é possível excluir categoria que possui produtos associados')
    }

    const result = await queryWithRLS(tenantId, 
      'DELETE FROM categorias WHERE id = $1', 
      [id]
    )
    return result.length > 0
  }

  async count(tenantId: string): Promise<number> {
    const result = await queryWithRLS(tenantId, 
      'SELECT COUNT(*) as count FROM categorias'
    )
    return parseInt(result[0].count)
  }
} 