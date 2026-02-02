import os
import re

# 汉化字典：(英文, 中文)
# 这里的匹配会非常小心，尽量匹配完整的字符串或带有 HTML 标签包裹的内容
TRANSLATIONS = {
    # 基础 UI
    r'>Dashboard<': r'>控制面板<',
    r'>Tools<': r'>工具箱<',
    r'>Settings<': r'>设置<',
    r'>Search...<': r'>搜索...<',
    r'placeholder="Search files..."': r'placeholder="搜索文件..."',
    r'placeholder="Search..."': r'placeholder="搜索..."',
    r'>Loading...<': r'>加载中...<',
    r'>Cancel<': r'>取消<',
    r'>Save<': r'>保存<',
    r'>Delete<': r'>删除<',
    r'>Remove<': r'>移除<',
    r'>Edit<': r'>编辑<',
    r'>Add<': r'>添加<',
    r'>Refresh<': r'>刷新<',
    r'>Rename<': r'>重命名<',
    r'>Download<': r'>下载<',
    r'>Upload<': r'>上传<',
    r'>Name<': r'>名称<',
    r'>Size<': r'>大小<',
    r'>Status<': r'>状态<',
    r'>Action<': r'>操作<',
    
    # 种子状态
    r"label: 'Downloading'": r"label: '下载中'",
    r"label: 'Seeding'": r"label: '做种中'",
    r"label: 'Stopped'": r"label: '已停止'",
    r"label: 'Stalled'": r"label: '暂停中'",
    r"label: 'Queued'": r"label: '排队中'",
    r"label: 'Checking'": r"label: '校验中'",
    r"label: 'Forced'": r"label: '强制'",
    r"label: 'Metadata'": r"label: '元数据'",
    r"label: 'Error'": r"label: '错误'",
    r"label: 'Missing'": r"label: '缺失'",
    r"label: 'Complete'": r"label: '已完成'",
    
    # 文件浏览器
    r'>File Browser<': r'>文件浏览器<',
    r'>Last Modified<': r'>修改日期<',
    r'>New Folder<': r'>新建文件夹<',
    
    # 设置面板
    r"label: 'Behavior'": r"label: '常规/行为'",
    r"label: 'Downloads'": r"label: '下载设置'",
    r"label: 'Connection'": r"label: '连接设置'",
    r"label: 'Speed'": r"label: '速度设置'",
    r"label: 'BitTorrent'": r"label: 'BitTorrent'",
    r"label: 'RSS'": r"label: 'RSS 设置'",
    r"label: 'WebUI'": r"label: 'WebUI 设置'",
    r"label: 'Advanced'": r"label: '高级设置'",
    
    # 日志查看器
    r'>Log Viewer<': r'>日志查看器<',
    r"label: 'Normal'": r"label: '常规'",
    r"label: 'Info'": r"label: '信息'",
    r"label: 'Warning'": r"label: '警告'",
    r"label: 'Critical'": r"label: '错误'",
    r"label: 'Newest first'": r"label: '最新优先'",
    r"label: 'Oldest first'": r"label: '最早优先'",
    r'>Live<': r'>实时刷新<',
    
    # 移动端
    r'>All Instances<': r'>全部实例<',
    r'>Manage Themes<': r'>管理主题<',
    r'>New Theme<': r'>新建主题<',
    r'>No custom themes yet<': r'>暂无自定义主题<',
    r'>Theme Name<': r'>主题名称<',
    r'>Save Theme<': r'>保存主题<',
}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in TRANSLATIONS.items():
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    count = 0
    for root, dirs, files in os.walk('locales'):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                if process_file(os.path.join(root, file)):
                    count += 1
    print(f"Localized {count} files.")

if __name__ == "__main__":
    main()
