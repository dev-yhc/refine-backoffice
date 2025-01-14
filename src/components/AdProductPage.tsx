import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from 'lucide-react'

interface VideoContent {
  id: string
  name: string
  url: string
  tier: '1' | '2' | '3'
}

export default function AdProductContainer() {
  const [videoContents, setVideoContents] = useState<VideoContent[]>([])
  const [newContent, setNewContent] = useState<Omit<VideoContent, 'id'>>({
    name: '',
    url: '',
    tier: '1'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContent({ ...newContent, [e.target.name]: e.target.value })
  }

  const handleTierChange = (value: '1' | '2' | '3') => {
    setNewContent({ ...newContent, tier: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = Math.random().toString(36).substr(2, 9)
    setVideoContents([...videoContents, { ...newContent, id }])
    setNewContent({ name: '', url: '', tier: '1' })
  }

  const handleDelete = (id: string) => {
    setVideoContents(videoContents.filter(content => content.id !== id))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RTB Video Content Management</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Video Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Video Name"
              value={newContent.name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="url"
              placeholder="Video URL"
              value={newContent.url}
              onChange={handleInputChange}
              required
            />
            <Select onValueChange={handleTierChange} value={newContent.tier}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1</SelectItem>
                <SelectItem value="2">Tier 2</SelectItem>
                <SelectItem value="3">Tier 3</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Add Video Content</Button>
          </form>
        </CardContent>
      </Card>

      {['1', '2', '3'].map((tier) => (
        <Card key={tier} className="mb-4">
          <CardHeader>
            <CardTitle>Tier {tier} Video Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoContents
                  .filter(content => content.tier === tier)
                  .map(content => (
                    <TableRow key={content.id}>
                      <TableCell>{content.name}</TableCell>
                      <TableCell>{content.url}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(content.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

