<template>
  <div class="search-div">
    <!-- 搜索表单 -->
    <el-form label-width="70px" size="small">
      <el-form-item label="角色名称">
        <el-input style="width: 100%" placeholder="角色名称"></el-input>
      </el-form-item>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="searchSysRole">
          搜索
        </el-button>
        <el-button size="small">重置</el-button>
      </el-row>
    </el-form>

    <!-- 添加按钮 -->
    <div class="tools-div">
      <el-button type="success" size="small" @click="addShow">
        添 加
      </el-button>
      <el-button type="warning" size="small" @click="showAssignMenu">
        分配菜单
      </el-button>
    </div>
    <!--添加角色表单对话框-->
    <el-dialog v-model="diaglogVisible" title="添加或修改角色" width="30%">
      <el-form label-width="120px">
        <el-form-item label="角色名称">
          <el-input v-model="sysRole.roleName" />
        </el-form-item>
        <el-form-item label="角色code">
          <el-input v-model="sysRole.roleCode" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="diaglogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 分配菜单的对话框  -->
    <el-dialog
      v-model="dialogMenuVisible"
      title="分配菜单"
      width="40%"
      #default="scope"
    >
      <el-form label-width="80px">
        <el-tree
          :data="sysMenuTreeList"
          show-checkbox
          default-expand-all
          node-key="id"
          :props="defaultProps"
          :check-on-click-node="true"
        />
        <el-form-item>
          <el-button type="primary" @click="doAssign(scope.row.id)">
            提交
          </el-button>
          <el-button @click="dialogMenuVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--- 角色表格数据 -->
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="roleName" label="角色名称" width="180" />
      <el-table-column prop="roleCode" label="角色code" width="180" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" align="center" width="280" #default="scope">
        <el-button type="primary" size="small" @click="editShow(scope.row)">
          修改
        </el-button>
        <el-button type="danger" size="small" @click="deleteById(scope.row)">
          删除
        </el-button>
      </el-table-column>
    </el-table>

    <el-tree
      :data="sysMenuTreeList"
      ref="tree"
      show-checkbox
      default-expand-all
      :check-on-click-node="true"
      node-key="id"
      :props="defaultProps"
    />

    <!--分页条-->
    <el-pagination
      v-model:current-page="pageParams.page"
      v-model:page-size="pageParams.limit"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      @size-change="fetchData"
      @current-change="fetchData"
      :total="total"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  GetSysRoleListByPage,
  SaveSysRole,
  UpdateSysRole,
  DeleteSysRoleById,
  GetSysRoleMenuIds,
  DoAssignMenuIdToSysRole,
} from '@/api/sysRole'
import { ElMessage, ElMessageBox } from 'element-plus'
// 分页条总记录数
let total = ref(0)

// 定义表格数据模型
let list = ref([
  {
    id: 9,
    roleName: '系统管理员',
    roleCode: 'xtgly',
    createTime: '2023-05-09',
  },
  {
    id: 10,
    roleName: '商品管理员',
    roleCode: 'spgly',
    createTime: '2023-05-09',
  },
])
const pageParamForm = {
  page: 1,
  limit: 10,
}
const pageParams = ref(pageParamForm)
//搜索表单数据
const queryDto = ref({ roleName: ' ' })

onMounted(() => {
  fetchData()
})

const searchSysRole = () => {
  fetchData()
}

const fetchData = async () => {
  const { data, code, message } = await GetSysRoleListByPage(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto
  )
  list.value = data.list
  total.value = data.total
}

//增加表单
const diaglogVisible = ref(false)
const addShow = () => {
  diaglogVisible.value = true
}
//修改按钮
const editShow = row => {
  sysRole.value = row
  diaglogVisible.value = true
}
//提交表单
const defaultForm = {
  id: '',
  roleCode: '',
  roleName: '',
}
const sysRole = ref(defaultForm)

//添加角色
const submit = async () => {
  if (!sysRole.value.id) {
    const { code } = await SaveSysRole(sysRole.value)
    if (code === 200) {
      diaglogVisible.value = false
      ElMessage.success('操作成功')
      fetchData()
    }
  } else {
    const { code } = await UpdateSysRole(sysRole.value)
    if (code === 200) {
      diaglogVisible.value = false
      ElMessage.success('操作成功')
      fetchData()
    }
  }
}
//删除角色
const deleteById = row => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const { code } = await DeleteSysRoleById(row.id.toString())
      if (code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      }
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}
//分配菜单
const defaultProps = {
  children: 'children',
  label: 'title',
}
const dialogMenuVisible = ref(false)
const sysMenuTreeList = ref([
  {
    id: 1,
    title: '系统管理',
    children: [
      { id: 2, title: '用户管理' },
      { id: 3, title: '角色管理' },
      { id: 4, title: '菜单管理' },
    ],
  },
  {
    id: 5,
    title: '数据管理',
    component: 'base',
    sortValue: 2,
    status: 1,
    createTime: '2023-05-04',
    children: [
      { id: 6, title: '商品单位' },
      { id: 7, title: '地区管理' },
    ],
  },
])
// 树对象变量
const tree = ref()

// 默认选中的菜单数据集合
const showAssignMenu = async row => {
  dialogMenuVisible.value = true
  const { data } = await GetSysRoleMenuIds(row.id) // 请求后端地址获取所有的菜单数据，以及当前角色所对应的菜单数据
  sysMenuTreeList.value = data.sysMenuList
  tree.value.setCheckedKeys(data.roleMenuIds) // 进行数据回显
}

const doAssign = async roleId => {
  const checkedNodes = tree.value.getCheckedNodes()
  const checkedNodesIds = checkedNodes.map(node => {
    return {
      id: node.id,
      isHalf: 0,
    }
  })

  //获取半选中的节点的数据，当一个节点的子节点被选中时，他将会呈现半选中的状态
  const halfCheckedNodes = tree.value.getCheckedNodes()
  const halfChedkedNodesIds = halfCheckedNodes.map(node => {
    return {
      id: node.id,
      isHalf: 1,
    }
  })

  //将选中的id和半选中的id进行合并
  const menuIds = [...checkedNodesIds, ...halfChedkedNodesIds]
  console.log(menuIds)
  //构建请求数据
  const assignMenuDto = {
    roleId: roleId,
    menuIdList: menuIds,
  }
  await DoAssignMenuIdToSysRole(assignMenuDto)
  ElMessage.success('操作成功')
  dialogMenuVisible.value = false
}
</script>

<style scoped>
.search-div {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}

.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
</style>
