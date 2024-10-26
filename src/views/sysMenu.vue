<template>
  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">添 加</el-button>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%">
    <el-form label-width="120px">
      <el-form-item label="菜单标题">
        <el-input />
      </el-form-item>
      <el-form-item label="路由名称">
        <el-input />
      </el-form-item>
      <el-form-item label="排序">
        <el-input />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group>
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdate">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-table
    :data="list"
    style="width: 100%; margin-bottom: 20px"
    row-key="id"
    border
    default-expand-all
  >
    <el-table-column prop="title" label="菜单标题" />
    <el-table-column prop="component" label="路由名称" />
    <el-table-column prop="sortValue" label="排序" />
    <el-table-column prop="status" label="状态" #default="scope">
      {{ scope.row.status == 1 ? '正常' : '停用' }}
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" align="center" width="280">
      <el-button type="success" size="small" @click="addShow(scope.row)">
        添加下级节点
      </el-button>
      <el-button type="primary" size="small" @click="editShow(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="remove(scope.row.id)">
        删除
      </el-button>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  FindNodes,
  SaveMenu,
  RemoveSysMenuById,
  UpdateSysMenuById,
} from '@/api/sysMenu'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义表格数据模型
const list = ref([])

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  const { code, message, data } = await FindNodes()
  list.value = data
}

const diaglogTitle = ref('添加')
const diaglogVisible = ref(false)

const addShow = row => {
  sysMenu.value = {}
  diaglogVisible.value = true
  if (!row.id) {
    diaglogTitle.value = '添加'
  } else {
    diaglogTitle.value = '添加下级节点'
    sysMenu.value.parentId = row.id
  }
}

//页面表单数据
const defaultForm = {
  id: '',
  parentId: 0,
  title: '',
  url: '',
  component: '',
  icon: '',
  sortValue: 1,
  status: 1,
}

// 表单响应式数据模型对象
const sysMenu = ref(defaultForm)

//提交保存与修改
const saveOrUpdate = () => {
  if (!sysMenu.value.id) {
    saveData()
  } else {
    updateData()
  }
}

// 新增
const saveData = async () => {
  await SaveMenu(sysMenu.value)
  diaglogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const editShow = row => {
  sysMenu.value = row
  diaglogVisible.value = true
}

const updateData = async () => {
  await UpdateSysMenuById(sysMenu.value)
  diaglogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const remove = async id => {
  console.log('removeDataById:' + id)
  ElMessageBox.confirm('此操作将永久删除该记录，是否继续？', 'Warning', {
    cofirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const { code, message } = await RemoveSysMenuById(id)
      if (code == 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(message)
      }
    })
    .catch(() => {
      ElMessage.error('取消删除')
    })
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
