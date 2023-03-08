class Counter:
  def __init__(self, start, end):
    self.num = start
    self.end = end
   
  def __iter__(self):
    return self
  
  def __next__(self):
    if self.num > self.end:
        raise StopIteration
    else:
      self.num += 1
      return self.num - 1
