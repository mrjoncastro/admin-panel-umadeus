import { queryWithRLS, query } from '../database/connection'
import { Product, CreateProductRequest, UpdateProductRequest, QueryFilters } from '../types'

export class ProductRepository {
  async findAll(tenantId: string, filters: QueryFilters = {}): Promise<Product[]> {
    const {
      page = 1,
      perPage = 20,
      ativo,
      categoria,
      slug,
      search
    } = filters

    let whereConditions: string[] = []
    let params: unknown[] = []
    let paramIndex = 1

    if (ativo !== undefined) {
      whereConditions.push(`ativo = $${paramIndex}`)
      params.push(ativo)
      paramIndex++
    }

    if (categoria) {
      whereConditions.push(`categoria = $${paramIndex}`)
      params.push(categoria)
      paramIndex++
    }

    if (slug) {
      whereConditions.push(`slug = $${paramIndex}`)
      params.push(slug)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(nome ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    // Ajuste para produtos públicos
    whereConditions.push(`(cliente = $${paramIndex} OR publico = true)`)
    params.push(tenantId)
    paramIndex++

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    const offset = (page - 1) * perPage

    const sql = `
      SELECT * FROM produtos 
      ${whereClause}
      ORDER BY created DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(perPage, offset)

    return await queryWithRLS(tenantId, sql, params)
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const products = await queryWithRLS(tenantId, 
      'SELECT * FROM produtos WHERE id = $1', 
      [id]
    )
    return products.length > 0 ? products[0] : null
  }

  async findBySlug(tenantId: string, slug: string): Promise<Product | null> {
    const products = await queryWithRLS(tenantId, 
      'SELECT * FROM produtos WHERE slug = $1', 
      [slug]
    )
    return products.length > 0 ? products[0] : null
  }

  async create(tenantId: string, productData: CreateProductRequest): Promise<Product> {
    const {
      nome,
      user_org,
      quantidade,
      preco,
      preco_bruto,
      ativo = true,
      tamanhos,
      imagens,
      descricao,
      detalhes,
      categoria,
      slug,
      cores,
      generos,
      exclusivo_user = false,
      requer_inscricao_aprovada = false,
      evento_id
    } = productData

    const sql = `
      INSERT INTO produtos (
        nome, user_org, quantidade, preco, preco_bruto, ativo,
        tamanhos, imagens, descricao, detalhes, categoria, slug,
        cores, generos, cliente, exclusivo_user, requer_inscricao_aprovada, evento_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `

    const params = [
      nome, user_org, quantidade, preco, preco_bruto, ativo,
      tamanhos, imagens, descricao, detalhes, categoria, slug,
      cores, generos, tenantId, exclusivo_user, requer_inscricao_aprovada, evento_id
    ]

    const products = await queryWithRLS(tenantId, sql, params)
    return products[0]
  }

  async update(tenantId: string, id: string, productData: UpdateProductRequest): Promise<Product | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    // Construir dinamicamente os campos a serem atualizados
    Object.entries(productData).forEach(([key, value]) => {
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
      UPDATE produtos 
      SET ${fields.join(', ')}, updated = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const products = await queryWithRLS(tenantId, sql, values)
    return products.length > 0 ? products[0] : null
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await queryWithRLS(tenantId, 
      'DELETE FROM produtos WHERE id = $1', 
      [id]
    )
    return result.length > 0
  }

  async count(tenantId: string, filters: QueryFilters = {}): Promise<number> {
    const { ativo, categoria, search } = filters

    let whereConditions: string[] = []
    let params: unknown[] = []
    let paramIndex = 1

    if (ativo !== undefined) {
      whereConditions.push(`ativo = $${paramIndex}`)
      params.push(ativo)
      paramIndex++
    }

    if (categoria) {
      whereConditions.push(`categoria = $${paramIndex}`)
      params.push(categoria)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(nome ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    const sql = `SELECT COUNT(*) as count FROM produtos ${whereClause}`
    const result = await queryWithRLS(tenantId, sql, params)
    return parseInt(result[0].count)
  }

  // Método para atualizar estoque (usado no checkout)
  async updateStock(tenantId: string, id: string, quantity: number): Promise<Product | null> {
    const sql = `
      UPDATE produtos 
      SET quantidade = quantidade - $1, 
          ativo = CASE WHEN quantidade - $1 <= 0 THEN false ELSE ativo END,
          updated = NOW()
      WHERE id = $2 AND quantidade >= $1
      RETURNING *
    `

    const products = await queryWithRLS(tenantId, sql, [quantity, id])
    return products.length > 0 ? products[0] : null
  }
} 